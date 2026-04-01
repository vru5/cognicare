import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { prisma } from "../../lib/prisma.js";
import { startOfDay, endOfDay, format } from "date-fns";
import crypto from "crypto";
import { AiInsightSummary } from "../../../src/features/insights/types/insightsTypes.js";
import { Prisma, SymptomLog } from "@prisma/client";
import { AI_INSIGHTS_PROMPT } from "../../constants/prompts.js";

export async function getAIInsightsSummary(patientId: string, startDate: string, endDate: string) {
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

  // Generate hash from logs to detect data changes
  const logsHash = crypto
    .createHash("md5")
    .update(JSON.stringify(logs.map((l: SymptomLog) => ({ id: l.id, t: l.createdAt.getTime() }))))
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
      console.log(`[AI-CACHE] Cache HIT for patient ${patientId} (${normStart} to ${normEnd})`);
      return cachedResult.data as unknown as AiInsightSummary;
    } else {
      console.log(`[AI-CACHE] Cache STALE for patient ${patientId}. DB Hash: ${cachedResult.hash}, New Hash: ${logsHash}`);
    }
  } else {
    console.log(`[AI-CACHE] Cache MISS for patient ${patientId}. No entry found for ${normStart} to ${normEnd}`);
  }

  console.log(`[AI-CACHE] Generating new insights for patient ${patientId}...`);

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

  const prompt = AI_INSIGHTS_PROMPT(startDate, endDate, formattedLogs);

  try {
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (apiErr: unknown) {
      const errorMessage = apiErr instanceof Error ? apiErr.message : String(apiErr);
      if (errorMessage.includes("503")) {
          const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          result = await fallbackModel.generateContent(prompt);
      } else {
          throw apiErr;
      }
    }

    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
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
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    throw new Error("Failed to generate AI insights.");
  }
}
