import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { AppError } from "server/types/logsApi";

/**
 * API call to Gemini LLM to convert base64 audio to a text format
 * @param base64Audio 
 * @returns text from audio
 */
export async function transcribeAudioAction(base64Audio: string) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return { success: false, error: "Gemini API Key is not configured." };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    // Clean the base64 string: remove data URI prefix and any whitespace/newlines
    const cleanBase64 = base64Audio
      .replace(/^data:audio\/\w+;base64,/, "")
      .replace(/\s/g, "");

    // Determine mime type: default to wav, but check for AAC (//FQ) or MP3 (//NI or ID3)
    let mimeType = "audio/wav";
    if (cleanBase64.startsWith("//FQ") || cleanBase64.startsWith("AAA")) {
      mimeType = "audio/aac";
    } else if (
      cleanBase64.startsWith("//NI") ||
      cleanBase64.startsWith("SUQz")
    ) {
      mimeType = "audio/mpeg";
    }

    let result;
    const promptParams: (string | Part)[] = [
      {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      },
      "Transcribe this audio exactly as spoken. Return ONLY the spoken text. DO NOT include timestamps, time ranges, or any formatting like [0:00]. If no speech is detected, return an empty string.",
    ];

    try {
      console.log(`Sending to Gemini for transcription (mime: ${mimeType})...`);
      result = await model.generateContent(promptParams);
    } catch (apiErr: unknown) {
      const err = apiErr as AppError;
      if (err.status === 503 || err.message?.includes("503")) {
        console.warn(
          "Gemini 2.5 is overloaded (503), falling back to 1.5-flash...",
        );
        const fallbackModel = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
        });
        result = await fallbackModel.generateContent(promptParams);
      } else {
        throw apiErr;
      }
    }

    const text = result.response.text().trim();
    return { success: true, text };
  } catch (error: unknown) {
    const err = error as AppError;
    console.error("Google Transcription Error:", error);
    if (
      err.message?.includes("429") ||
      err.message?.toLowerCase().includes("quota")
    ) {
      return {
        success: false,
        error: "Google API Quota Exceeded.",
        details: "quota_exceeded",
      };
    }
    return {
      success: false,
      error: err.message || "Failed to transcribe audio",
      details: err.code || "google_api_error",
    };
  }
}
