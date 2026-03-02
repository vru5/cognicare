/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function transcribeAudio(base64Audio: string) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing, transcription will fail.");
    return { success: false, error: "Gemini API Key is not configured." };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // gemini-2.5-flash is confirmed available for this API key
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/wav",
          data: base64Audio,
        },
      },
      "Transcribe this audio exactly as spoken. Return only the transcription text, no preamble or extra commentary.",
    ]);

    const text = result.response.text().trim();
    console.log("Google Transcription success:", text);
    return { success: true, text };
  } catch (error: any) {
    console.error("Google Transcription Error:", error);

    // Explicitly handle 429 (Too Many Requests) / Quota errors
    if (
      error.message?.includes("429") ||
      error.message?.toLowerCase().includes("quota")
    ) {
      return {
        success: false,
        error:
          "Google API Quota Exceeded. This often means you need to link a payment card in Google Cloud Console to activate your free tier (even for free usage).",
        details: "quota_exceeded",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to transcribe audio with Gemini",
      details: error.code || "google_api_error",
    };
  }
}
