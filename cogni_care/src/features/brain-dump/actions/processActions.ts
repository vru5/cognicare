import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { prisma } from "@/lib/prisma";

export async function processBrainDumpAction(rawText: string, patientId: string) {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        const safeText = mask(rawText || "");

        const prompt = `Analyze the following patient health log.
    Categorize the content into exactly these fields: physical, mood, cognitive, sleep, social.
    - For each field, provide a single word or very short phrase describing the symptom or state.
    - If a category is not mentioned or the input is nonsensical/gibberish, return null for that field.
    - DO NOT make up information. If the input is just random characters or unrelated to health, return null for ALL fields.
    - Return output strictly as a JSON object.
    
    Log: "${safeText}"`;

        let responseText: string;
        let analysis: any = null;

        try {
            const result = await model.generateContent(prompt);
            responseText = result.response.text();
            responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            analysis = JSON.parse(responseText || "{}");

            // Post-processing: If AI returns "General wellness" or similar for nonsensical input, treat as null
            const genericPhrases = ["general wellness", "healthy", "normal", "no issues", "none"];
            ["physical", "mood", "cognitive", "sleep", "social"].forEach(key => {
                if (analysis[key] && genericPhrases.includes(analysis[key].toLowerCase())) {
                    analysis[key] = null;
                }
            });
        } catch (apiErr: any) {
            console.error("Gemini API Error:", apiErr);
            throw new Error("AI processing failed. Please check your API key and network connection.");
        }

        const userExists = await prisma.user.findUnique({ where: { id: patientId } });
        if (!userExists) {
            return { success: false, error: `Patient ID ${patientId} not found.` };
        }

        const log = await prisma.symptomLog.create({
            data: {
                patientId,
                rawText: safeText,
                physical: analysis.physical,
                mood: analysis.mood,
                cognitive: analysis.cognitive,
                sleep: analysis.sleep,
                social: analysis.social,
            },
        });
        return { success: true, log };
    } catch (err: any) {
        return { success: false, error: err.message || "Processing failed" };
    }
}
