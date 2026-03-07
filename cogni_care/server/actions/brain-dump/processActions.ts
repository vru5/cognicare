import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { prisma } from "../../lib/prisma.js";

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
            let result;
            try {
                result = await model.generateContent(prompt);
            } catch (apiErr: any) {
                if (apiErr.status === 503 || apiErr.message?.includes("503")) {
                    console.warn("Gemini 2.5 is overloaded (503), falling back to 1.5-flash...");
                    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    result = await fallbackModel.generateContent(prompt);
                } else {
                    throw apiErr;
                }
            }
            responseText = result.response.text();
            responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            analysis = JSON.parse(responseText || "{}");
            console.log("AI Analysis Result:", JSON.stringify(analysis, null, 2));

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

        console.log(`Verifying Patient Profile for ID: "${patientId}"`);

        // We must check the Profile table because PAT- IDs are NOT in the User table
        const profile = await (prisma as any).profilePatient.findUnique({
            where: { id: patientId }
        });

        if (!profile) {
            console.error(`Patient Profile not found for ID: ${patientId}`);
            return { success: false, error: `Patient ID ${patientId} not found in Profile records.` };
        }

        const log = await prisma.symptomLog.create({
            data: {
                patientId: profile.id,
                rawText: safeText,
                physical: analysis.physical,
                mood: analysis.mood,
                cognitive: analysis.cognitive,
                sleep: analysis.sleep,
                social: analysis.social,
            },
        });

        // Check if all categories are null
        const allNull = !analysis.physical && !analysis.mood && !analysis.cognitive && !analysis.sleep && !analysis.social;
        if (allNull) {
            return { success: true, log, message: "No specific symptoms detected in this entry." };
        }

        return { success: true, log };
    } catch (err: any) {
        return { success: false, error: err.message || "Processing failed" };
    }
}
