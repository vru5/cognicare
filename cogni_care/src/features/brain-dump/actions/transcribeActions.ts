import { GoogleGenerativeAI } from "@google/generative-ai";

export async function transcribeAudioAction(base64Audio: string) {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
        return { success: false, error: "Gemini API Key is not configured." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
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
        return { success: true, text };
    } catch (error: any) {
        console.error("Google Transcription Error:", error);
        if (error.message?.includes("429") || error.message?.toLowerCase().includes("quota")) {
            return { success: false, error: "Google API Quota Exceeded.", details: "quota_exceeded" };
        }
        return { success: false, error: error.message || "Failed to transcribe audio", details: error.code || "google_api_error" };
    }
}
