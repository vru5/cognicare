import { prisma } from "../lib/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";

export async function getLogsAction(patientId: string) {
    try {
        const logs = await prisma.symptomLog.findMany({
            where: { patientId },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, logs };
    } catch (error: any) {
        console.error("Failed to fetch logs:", error);
        return { success: false, error: "Failed to fetch logs" };
    }
}

export async function updateSymptomLogAction(logId: string, newText: string, patientId: string) {
    try {
        const existingLog = await prisma.symptomLog.findUnique({
            where: { id: logId }
        });

        if (!existingLog || existingLog.patientId !== patientId) {
            return { success: false, error: "Log not found or unauthorized" };
        }

        // Process new text through Gemini
        const apiKey = (process.env.GEMINI_API_KEY || "").trim();
        if (!apiKey) {
            return { success: false, error: "Server missing Gemini API Key" };
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const safeText = mask(newText || "");

        const prompt = `Analyze the following patient health log.
    Categorize the content into exactly these fields: physical, mood, cognitive, sleep, social.
    - For each field, provide a single word or very short phrase (e.g., 'Headache', 'Happy', 'Exhausted').
    - If a category is not mentioned, return null for that field.
    - Return output strictly as a JSON object.
    
    Log: "${safeText}"`;

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
        let responseText = result.response.text();
        responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const analysis = JSON.parse(responseText || "{}");

        const updatedLog = await prisma.symptomLog.update({
            where: { id: logId },
            data: {
                rawText: newText,
                physical: analysis.physical || null,
                mood: analysis.mood || null,
                cognitive: analysis.cognitive || null,
                sleep: analysis.sleep || null,
                social: analysis.social || null,
            }
        });

        return { success: true, log: updatedLog };

    } catch (err: any) {
        console.error("Failed to update log:", err);
        return { success: false, error: "Failed to update log processing text" };
    }
}
