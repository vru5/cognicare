import { LogSumaryCard } from "@/features/logs/types/logSummaryCard.js";
import { prisma } from "../../lib/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { ApiError } from "next/dist/server/api-utils/index.js";
import { Analysis, SymptomRecord } from "server/types/logsApi.js";


export async function getLogsAction(patientId: string) {
    try {
        const logs = await prisma.symptomLog.findMany({
            where: { patientId },
            orderBy: { createdAt: "desc" },
        });
        const filteredLogs = logs.map((log: LogSumaryCard) =>
            Object.fromEntries(
                Object.entries(log).filter(([_, value]) => value !== null)
            )
        );
        return { success: true, logs: filteredLogs };
    } catch (error: unknown) {
        console.error("Failed to fetch logs:", error);
        return { success: false, error: "Failed to fetch logs" };
    }
}

export async function createManualLogAction(data: { patientId: string; rawText: string; isFromCarer?: boolean }) {
    try {
        const { patientId, rawText, isFromCarer = false } = data;

        let analysis: Partial<Analysis> = {};

        // Only categorize if NOT from a carer
        if (!isFromCarer) {
            const apiKey = (process.env.GEMINI_API_KEY || "").trim();
            if (apiKey) {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const safeText = mask(rawText || "");
                const prompt = `Analyze the following patient health log.
Categorize the content into exactly these fields: physical, mood, cognitive, sleep, social.
- For each field, provide a single word or very short phrase (e.g., 'Headache', 'Happy').
- If a category is not mentioned, return null for that field.
- Return output strictly as a JSON object.

Log: "${safeText}"`;

                try {
                    let result;
                    try {
                        result = await model.generateContent(prompt);
                    } catch (err: unknown) {
                        const apiErr = err as ApiError;
                        if (apiErr?.message?.includes("503")) {
                            console.warn("Gemini 2.5 is overloaded, falling back to 1.5-flash...");
                            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                            result = await fallbackModel.generateContent(prompt);
                        } else {
                            throw apiErr;
                        }
                    }
                    let responseText = result.response.text();
                    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
                    analysis = JSON.parse(responseText || "{}");
                } catch (err) {
                    console.warn("Gemini processing failed during manual creation:", err);
                }
            }
        }

        const log = await prisma.symptomLog.create({
            data: {
                patientId,
                rawText,
                isFromCarer,
                physical: analysis.physical || null,
                mood: analysis.mood || null,
                cognitive: analysis.cognitive || null,
                sleep: analysis.sleep || null,
                social: analysis.social || null,
            }
        });

        return { success: true, log };
    } catch (error) {
        console.error("Failed to create manual log:", error);
        return { success: false, error: "Failed to create log" };
    }
}

export async function updateSymptomLogAction(logId: string, data: { newText?: string; patientId: string; carerComment?: string }) {
    try {
        const { newText, patientId, carerComment } = data;

        const existingLog = await prisma.symptomLog.findUnique({
            where: { id: logId }
        });

        if (!existingLog || existingLog.patientId !== patientId) {
            return { success: false, error: "Log not found or unauthorized" };
        }

        let updateData: Partial<SymptomRecord> = {};

        if (carerComment !== undefined) {
            updateData.carerComment = carerComment;
        }

        if (newText !== undefined) {
            // Only categorize if it's NOT a carer-authored log
            if (!existingLog.isFromCarer) {
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

                try {
                    let result;
                    try {
                        result = await model.generateContent(prompt);
                    } catch (err: unknown) {
                        const apiErr = err as ApiError;
                        if (apiErr?.message?.includes("503")) {
                            console.warn("Gemini 2.5 is overloaded, falling back to 1.5-flash...");
                            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                            result = await fallbackModel.generateContent(prompt);
                        } else {
                            throw apiErr;
                        }
                    }
                    let responseText = result.response.text();
                    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
                    const analysis: Analysis = JSON.parse(responseText || "{}");

                    updateData = {
                        ...updateData,
                        rawText: newText,
                        physical: analysis.physical || null,
                        mood: analysis.mood || null,
                        cognitive: analysis.cognitive || null,
                        sleep: analysis.sleep || null,
                        social: analysis.social || null,
                    };
                } catch (apiErr: unknown) {
                    console.error("Gemini processing failed during update:", apiErr);
                    // Still update the text even if AI fails
                    updateData.rawText = newText;
                }
            } else {
                // If it IS a carer log, just update the text without pillars
                updateData.rawText = newText;
            }
        }

        const updatedLog = await prisma.symptomLog.update({
            where: { id: logId },
            data: updateData
        });

        const filteredLog = Object.fromEntries(
            Object.entries(updatedLog).filter(([_, value]) => value !== null)
        );

        return { success: true, log: filteredLog };

    } catch (err: unknown) {
        console.error("Failed to update log:", err);
        return { success: false, error: "Failed to update log processing text" };
    }
}
