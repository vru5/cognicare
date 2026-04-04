import { SymptomRecord } from "./../../types/logsApi";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { prisma } from "../../lib/prisma.js";
import { Analysis, AppError } from "../../types/logsApi.js";
import { getIO } from "../../lib/socket.js";
import { LogActionResponse } from "../../types/logActions.js";

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
  } catch (e) {}

  try {
    const safeText = mask(rawText || "");

    const prompt = `Analyze the following patient health log.
    Extract the symptoms into the following pillars: physical, mood, cognitive, sleep, social.
    
    For each pillar, provide TWO fields in the JSON:
    1. The pillar name (e.g., 'physical'): A single word or very short phrase describing the symptom (e.g., 'Headache', 'Happy').
    2. The severity field (e.g., 'physicalSeverity'): A number from 1 to 10 evaluating how severe the symptom is based on the language used.
    
    If a category is not mentioned or the input is nonsensical/gibberish, return null for the string field and 0 or null for the severity field.
    DO NOT make up information. If the input is just random characters or unrelated to health, return null for ALL fields.
    Return output strictly as a JSON object, for example:
    {
      "physical": "Headache", "physicalSeverity": 8,
      "sleep": "Insomnia", "sleepSeverity": 9,
      "mood": null, "moodSeverity": null
    }
    
    Log: "${safeText}"`;

    let responseText: string;
    let analysis: Analysis = {};

    try {
      let result;
      try {
        result = await model.generateContent(prompt);
      } catch (apiErr: unknown) {
        const err = apiErr as AppError;
        if (err.message?.includes("503")) {
          console.warn(
            "Gemini 2.5 is overloaded (503), falling back to 1.5-flash...",
          );
          const fallbackModel = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
          });
          result = await fallbackModel.generateContent(prompt);
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
      console.log("AI Analysis Result:", JSON.stringify(analysis, null, 2));

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

    const log: SymptomRecord = await prisma.symptomLog.create({
      data: {
        patientId: profile.id,
        rawText,
        isFromCarer,
        carerId,
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

    // Notify associated carers via WebSocket
    try {
      const io = getIO();
      const patientId = profile.id;

      // 1. Notify the patient room (for real-time page updates)
      io.to(patientId).emit("new_notification", {
        type: "PATIENT_LOG",
        title: "New Symptom Log",
        body: isFromCarer ? "Your carer added a new log." : "A new symptom log has been recorded.",
      });
      io.to(patientId).emit("new_log", { patientId });

      // 2. Notify carers individually (for dashboard green dots)
      const patientCarers = await prisma.carersOnPatients.findMany({
        where: { patientId: profile.id },
        select: { carerId: true },
      });
      patientCarers.forEach((pc) => {
        io.to(pc.carerId).emit("new_log", { patientId: profile.id });
      });
      console.log(
        `[Socket] Notified ${patientCarers.length} carers about new Mind Dump log`,
      );
    } catch (e) {
      console.warn("[Socket] Failed to notify carers:", e);
    }

    return { success: true, log: { ...log, type: "patient" as const } };
  } catch (error: unknown) {
    const err = error as AppError;
    return { success: false, error: err.message || "Processing failed" };
  }
}
