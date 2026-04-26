import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { prisma } from "../../lib/prisma.js";
import { startOfDay, endOfDay, format, subDays } from "date-fns";
import crypto from "crypto";
import { AiInsightSummary } from "../../../src/features/insights/types/insightsTypes.js";
import { Prisma, SymptomLog } from "@prisma/client";
import { AI_INSIGHTS_PROMPT, PREDICTIVE_ANALYSIS_PROMPT } from "../../constants/prompts.js";

export async function getAIInsightsSummary(patientId: string, startDate: string, endDate: string, role: "patient" | "carer" = "carer") {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const start = startOfDay(new Date(startDate));
  const end = endOfDay(new Date(endDate));

  // Normalize date strings for stable cache keys (YYYY-MM-DD)
  const normStart = format(start, "yyyy-MM-dd");
  const normEnd = format(end, "yyyy-MM-dd");

  // Fetch logs for the range
  const logs = await prisma.symptomLog.findMany({
    where: {
      patientId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (logs.length === 0) {
    return {
      summary: "No symptom logs found for this period to analyze.",
      status: "stable",
      topConcern: null,
      keyFindings: [],
      criticalRisks: [],
    };
  }

  // Generate hash from logs AND role to detect data/tone changes
  const logsHash = crypto
    .createHash("md5")
    .update(JSON.stringify(logs.map((l: SymptomLog) => ({ id: l.id, t: l.createdAt.getTime() }))) + role)
    .digest("hex");

  // Check cache with safety fallback
  let cachedResult = null;
  try {
    cachedResult = await prisma.aiInsightCache.findUnique({
      where: {
        patientId_startDate_endDate: {
          patientId,
          startDate: normStart,
          endDate: normEnd,
        },
      },
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
      console.warn(`[AI-CACHE] Table 'ai_insight_cache' does not exist yet. Falling back to live LLM generation.`);
    } else {
      console.error(`[AI-CACHE] Cache lookup failed:`, err instanceof Error ? err.message : String(err));
    }
  }

  // If cache exists and hash matches, return cached data
  if (cachedResult) {
    if (cachedResult.hash === logsHash) {
      console.log(`[AI-CACHE] Cache HIT for patient ${patientId} (${normStart} to ${normEnd}) [Role: ${role}]`);
      return cachedResult.data as unknown as AiInsightSummary;
    } else {
      console.log(`[AI-CACHE] Cache STALE/ROLECHANGE for patient ${patientId}.`);
    }
  }

  console.log(`[AI-CACHE] Generating new ${role} insights for patient ${patientId}...`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Format logs for the prompt (Apply PII masking)
  const formattedLogs = logs.map((log: SymptomLog) => {
    const dateStr = format(new Date(log.createdAt), "yyyy-MM-dd");
    const source = log.isFromCarer ? "Carer" : "Patient";
    const safeText = mask(log.rawText || "");
    const pillars = [
      log.physical && `Physical: ${log.physical} (${log.physicalSeverity}/10)`,
      log.mood && `Mood: ${log.mood} (${log.moodSeverity}/10)`,
      log.cognitive && `Cognitive: ${log.cognitive} (${log.cognitiveSeverity}/10)`,
      log.sleep && `Sleep: ${log.sleep} (${log.sleepSeverity}/10)`,
      log.social && `Social: ${log.social} (${log.socialSeverity}/10)`,
    ]
      .filter(Boolean)
      .join(", ");

    return `[${dateStr}] [${source}] ${pillars}${safeText ? ` - "${safeText}"` : ""}`;
  }).join("\n");

  const prompt = AI_INSIGHTS_PROMPT(startDate, endDate, formattedLogs, role);

  try {
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (apiErr: unknown) {
      const errorMessage = apiErr instanceof Error ? apiErr.message : String(apiErr);
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("503") || errorMessage.includes("overloaded")) {
          console.warn("[Insights] Flash 2.5 overloaded/quota, falling back to 2.0...");
          try {
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            result = await fallbackModel.generateContent(prompt);
          } catch (fallbackErr: unknown) {
            const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
            if (fallbackMsg.includes("429") || fallbackMsg.includes("quota") || fallbackMsg.includes("503") || fallbackMsg.includes("overloaded")) {
              console.warn("[Insights] Flash 2.0 overloaded/quota, falling back to 2.5-flash-lite...");
              try {
                const liteFallback = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
                result = await liteFallback.generateContent(prompt);
              } catch (liteErr: unknown) {
                console.warn("[Insights] Lite fallback failed, attempting Pro...");
                const proFallback = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
                result = await proFallback.generateContent(prompt);
              }
            } else {
              throw fallbackErr;
            }
          }
      } else {
          throw apiErr;
      }
    }

    let responseText = result.response.text();
    // Robust extraction: find first { and last }
    const startIdx = responseText.indexOf("{");
    const endIdx = responseText.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1) {
      responseText = responseText.substring(startIdx, endIdx + 1);
    } else {
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    }
    
    const finalResult = JSON.parse(responseText);

    // Update cache with safety fallback
    try {
      await prisma.aiInsightCache.upsert({
        where: {
          patientId_startDate_endDate: {
            patientId,
            startDate: normStart,
            endDate: normEnd,
          },
        },
        update: {
          hash: logsHash,
          data: finalResult as unknown as Prisma.InputJsonValue,
        },
        create: {
          patientId,
          startDate: normStart,
          endDate: normEnd,
          hash: logsHash,
          data: finalResult as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
        console.warn(`[AI-CACHE] Table 'ai_insight_cache' does not exist yet. Result not cached.`);
      } else {
        console.error(`[AI-CACHE] Cache write failed:`, err instanceof Error ? err.message : String(err));
      }
    }

    return finalResult;
  } catch (error: any) {
    console.error("Gemini Insights Error Details:", error);
    throw new Error(`Failed to generate AI insights: ${error?.message || 'Unknown error'}`);
  }
}

export async function getPredictiveAnalysis(patientId: string, role: "patient" | "carer" = "carer") {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  // Fetch recent logs (last 30 days for context)
  const contextStart = subDays(new Date(), 30);
  const logs = await prisma.symptomLog.findMany({
    where: {
      patientId,
      createdAt: { gte: contextStart },
    },
    orderBy: { createdAt: "asc" },
  });

  if (logs.length < 3) {
    return {
      outlook: "More symptom logs are needed to provide a reliable 7-day outlook.",
      predictedTrend: "stable",
      watchList: [],
      proactiveSteps: ["Continue logging symptoms daily", "Maintain a consistent routine"],
    };
  }

  // Generate hash for logs AND role to detect data/tone changes
  const logsHash = crypto
    .createHash("md5")
    .update(JSON.stringify(logs.map((l: SymptomLog) => ({ id: l.id, t: l.createdAt.getTime() }))) + role)
    .digest("hex");

  let cachedResult = null;
  try {
    cachedResult = await (prisma as any).predictiveAnalysisCache.findUnique({
      where: { patientId },
    });
  } catch (err: unknown) {
    console.warn(`[PREDICTIVE-CACHE] Lookup failed:`, err instanceof Error ? err.message : String(err));
  }

  if (cachedResult && cachedResult.hash === logsHash) {
    console.log(`[PREDICTIVE-CACHE] HIT for patient ${patientId} [Role: ${role}]`);
    return cachedResult.data;
  }

  console.log(`[PREDICTIVE-CACHE] MISS/ROLECHANGE. Generating new ${role} prediction for patient ${patientId}...`);

  const genAI = new GoogleGenerativeAI(apiKey);
  // Default to 2.5 flash as it has separate quota
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const formattedLogs = logs.map((log: SymptomLog) => {
    const dateStr = format(new Date(log.createdAt), "yyyy-MM-dd");
    const pillars = [
      log.physical && `Physical: ${log.physicalSeverity}/10`,
      log.mood && `Mood: ${log.moodSeverity}/10`,
      log.cognitive && `Cognitive: ${log.cognitiveSeverity}/10`,
      log.sleep && `Sleep: ${log.sleepSeverity}/10`,
      log.social && `Social: ${log.socialSeverity}/10`,
    ].filter(Boolean).join(", ");
    return `[${dateStr}] ${pillars} - "${mask(log.rawText || "")}"`;
  }).join("\n");

  const prompt = PREDICTIVE_ANALYSIS_PROMPT("the patient", formattedLogs, role);

  try {
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (apiErr: any) {
      const errMsg = apiErr?.message || String(apiErr);
      if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("503")) {
          console.warn("[Predictive] Flash 2.5 overloaded/quota, falling back to 2.0...");
          try {
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            result = await fallbackModel.generateContent(prompt);
          } catch (fallbackErr: any) {
            const fbMsg = fallbackErr?.message || String(fallbackErr);
            if (fbMsg.includes("429") || fbMsg.includes("quota") || fbMsg.includes("503")) {
              console.warn("[Predictive] Flash 2.0 overloaded/quota, falling back to 2.5-flash-lite...");
              try {
                const liteFallback = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
                result = await liteFallback.generateContent(prompt);
              } catch (liteErr: any) {
                console.warn("[Predictive] Lite fallback failed, attempting Pro...");
                const proFallback = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
                result = await proFallback.generateContent(prompt);
              }
            } else {
              throw fallbackErr;
            }
          }
      } else throw apiErr;
    }

    let responseText = result.response.text();
    // Robust extraction: find first { and last }
    const startIdx = responseText.indexOf("{");
    const endIdx = responseText.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1) {
      responseText = responseText.substring(startIdx, endIdx + 1);
    } else {
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    }
    
    const finalResult = JSON.parse(responseText);

    try {
      await (prisma as any).predictiveAnalysisCache.upsert({
        where: { patientId },
        update: { hash: logsHash, data: finalResult },
        create: { patientId, hash: logsHash, data: finalResult },
      });
    } catch (err: unknown) {
      console.warn(`[PREDICTIVE-CACHE] Save failed:`, err instanceof Error ? err.message : String(err));
    }

    return finalResult;
  } catch (error: any) {
    console.error("Predictive Analysis Error:", error);
    throw new Error(`Failed to generate predictive analysis: ${error?.message}`);
  }
}
