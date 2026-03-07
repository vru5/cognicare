import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const promptParams = [
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
      result = await model.generateContent(promptParams as any);
    } catch (apiErr: any) {
      if (apiErr.status === 503 || apiErr.message?.includes("503")) {
        console.warn(
          "Gemini 2.5 is overloaded (503), falling back to 1.5-flash...",
        );
        const fallbackModel = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
        });
        result = await fallbackModel.generateContent(promptParams as any);
      } else {
        throw apiErr;
      }
    }

    const text = result.response.text().trim();
    return { success: true, text };
  } catch (error: any) {
    console.error("Google Transcription Error:", error);
    if (
      error.message?.includes("429") ||
      error.message?.toLowerCase().includes("quota")
    ) {
      return {
        success: false,
        error: "Google API Quota Exceeded.",
        details: "quota_exceeded",
      };
    }
    return {
      success: false,
      error: error.message || "Failed to transcribe audio",
      details: error.code || "google_api_error",
    };
  }
}
