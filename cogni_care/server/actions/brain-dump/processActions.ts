import { SymptomRecord } from "./../../types/logsApi";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { prisma } from "../../lib/prisma.js";
import { Analysis, AppError } from "../../types/logsApi.js";
import { getIO } from "../../lib/socket.js";
import { LogActionResponse } from "../../types/logActions.js";
import { PROCESS_BRAIN_DUMP_PROMPT } from "server/constants/prompts";

export async function processBrainDumpAction(
  rawText: string,
  patientId: string,
  isFromCarer: boolean = false,
  carerId?: string
): Promise<LogActionResponse> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Real-time status update
  try {
    getIO()
      .to(patientId)
      .emit("processing_status", {
        status: "analyzing",
        message: "Analyzing...",
      });
  } catch (e) { }

  try {
    console.log(`[SECURITY: PII_MASKING] Original Text: "${rawText}"`);
    const safeText = mask(rawText || "", { nlp: true });
    console.log(`[SECURITY: PII_MASKING] Redacted Text: "${safeText}"`);

    const prompt = PROCESS_BRAIN_DUMP_PROMPT(safeText);


    let responseText: string;
    let analysis: Analysis = {};

    try {
      let result;
      try {
        result = await model.generateContent(prompt);
      } catch (apiErr: unknown) {
        const err = apiErr as AppError;
        // 503 = Service Overloaded
        if (err.message?.includes("503") || err.message?.includes("overloaded")) {
          console.warn(
            "[AI_RESILIENCE: FALLBACK_TRIGGERED] Gemini Flash 2.5 is overloaded, pivoting to Gemini Flash-Lite...",
          );
          const fallbackModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
          });
          result = await fallbackModel.generateContent(prompt);
          console.log("[AI_RESILIENCE: SUCCESS] Fallback model generated content successfully.");
        } else {
          throw apiErr;
        }
      }
      responseText = result.response.text();
      responseText = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      analysis = JSON.parse(responseText || "{}");
      //console.log("AI Analysis Result:", JSON.stringify(analysis, null, 2));

      // Post-processing: If AI returns "General wellness" or similar for nonsensical input, treat as null
      const genericPhrases = [
        "general wellness",
        "healthy",
        "normal",
        "no issues",
        "none",
      ];

      const pillars = [
        "physical",
        "mood",
        "cognitive",
        "sleep",
        "social",
      ] as const;

      pillars.forEach((key) => {
        const val = analysis[key];
        if (
          typeof val === "string" &&
          genericPhrases.includes(val.toLowerCase())
        ) {
          analysis[key] = null;
          analysis[(key + "Severity") as keyof Analysis] = undefined;
        }
      });
    } catch (apiErr: unknown) {
      console.error("Gemini API Error:", apiErr);
      throw new Error(
        "AI processing failed. Please check your API key and network connection.",
      );
    }

    // We must check the Profile table because PAT- IDs are NOT in the User table
    const profile = await prisma.profilePatient.findUnique({
      where: { id: patientId },
    });

    if (!profile) {
      console.error(`Patient Profile not found for ID: ${patientId}`);
      return {
        success: false,
        error: `Patient ID ${patientId} not found in Profile records.`,
      };
    }

    // Check if all categories are null
    const allNull =
      !analysis.physical &&
      !analysis.mood &&
      !analysis.cognitive &&
      !analysis.sleep &&
      !analysis.social;

    if (allNull) {
      return {
        success: false,
        error:
          "We couldn't detect any specific health symptoms or updates in this entry. Please try being more specific.",
      };
    }

    console.log(`[DATABASE: PERSISTENCE] Committing validated SymptomLog to PostgreSQL for Patient: ${profile.id}`);
    const log: SymptomRecord = await prisma.symptomLog.create({
      data: {
        patientId: profile.id,
        rawText,
        isFromCarer,
        carerId: isFromCarer ? carerId : undefined,
        physical: analysis.physical,
        physicalSeverity: analysis.physicalSeverity,
        mood: analysis.mood,
        moodSeverity: analysis.moodSeverity,
        cognitive: analysis.cognitive,
        cognitiveSeverity: analysis.cognitiveSeverity,
        sleep: analysis.sleep,
        sleepSeverity: analysis.sleepSeverity,
        social: analysis.social,
        socialSeverity: analysis.socialSeverity,
      },
    });
    console.log(`[DATABASE: SUCCESS] Log ID ${log.id} persisted via Prisma.`);

    // Notify associated carers via WebSocket
    try {
      const io = getIO();
      const patientId = profile.id;

      // 1. Silent refresh for the patient's dashboard
      io.to(patientId).emit("new_log", { patientId });

      // 2. Notify carers individually (for dashboard green dots)
      const patientCarers = await prisma.carersOnPatients.findMany({
        where: { patientId: profile.id },
        select: { carerId: true },
      });
      patientCarers.forEach((pc) => {
        // Silent refresh for all carers
        io.to(pc.carerId).emit("new_log", { patientId: profile.id });
        console.log(`[SOCKET: BROADCAST] Emitted 'new_log' pulse to Carer room: ${pc.carerId}`);
      });
      // console.log(
      //   `[Socket] Notified ${patientCarers.length} carers about new Mind Dump log`,
      // );
    } catch (e) {
      console.warn("[Socket] Failed to notify carers:", e);
    }

    return { success: true, log: { ...log, type: "patient" as const } };
  } catch (error: unknown) {
    const err = error as AppError;
    return { success: false, error: err.message || "Processing failed" };
  }
}
