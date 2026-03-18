import { prisma } from "../../lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { ApiError } from "next/dist/server/api-utils";
import { Analysis, SymptomRecord, SymptomLogUpdateData } from "../../types/logsApi";
import { LogActionResponse } from "../../types/logActions";
import { getIO } from "../../lib/socket";

export async function createSymptomLogAction(patientId: string, rawText: string): Promise<LogActionResponse> {
    try {
        let analysis: Partial<Analysis> = {};

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
                analysis = JSON.parse(responseText || "{}") as Analysis;
            } catch (err) {
                console.warn("Gemini processing failed during manual creation:", err);
            }
        }

        const log = await prisma.symptomLog.create({
            data: {
                patientId,
                rawText,
                physical: analysis.physical || null,
                mood: analysis.mood || null,
                cognitive: analysis.cognitive || null,
                sleep: analysis.sleep || null,
                social: analysis.social || null,
            },
            include: { notes: true },
        });

        // Real-time notification
        try {
            const io = getIO();
            io.to(patientId).emit("new_notification", {
                type: "PATIENT_LOG",
                title: "New Patient Entry",
                body: "A new health entry has been recorded.",
                data: { note_id: log.id }
            });
            io.to(patientId).emit("new_log", { patientId });
        } catch (err) {
            console.warn("[Socket] Failed to emit PATIENT_LOG notification:", err);
        }

        return { success: true, log: { ...log, type: "patient" as const, comments: [] } };
    } catch (error) {
        console.error("Failed to create symptom log:", error);
        return { success: false, error: "Failed to create log" };
    }
}

export async function updateSymptomLogAction(logId: string, patientId: string, newText: string): Promise<LogActionResponse> {
    try {
        const symptomLog = await prisma.symptomLog.findUnique({ where: { id: logId } });

        if (!symptomLog || symptomLog.patientId !== patientId) {
            return { success: false, error: "Log not found or unauthorized" };
        }

        const apiKey = (process.env.GEMINI_API_KEY || "").trim();
        let updateData: SymptomLogUpdateData = { rawText: newText };

        if (apiKey) {
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
                    physical: analysis.physical || null,
                    mood: analysis.mood || null,
                    cognitive: analysis.cognitive || null,
                    sleep: analysis.sleep || null,
                    social: analysis.social || null,
                };
            } catch (apiErr: unknown) {
                console.error("Gemini processing failed during update:", apiErr);
            }
        }

        const updatedLog = await prisma.symptomLog.update({
            where: { id: logId },
            data: updateData,
            include: {
                notes: {
                    include: { carer: { include: { user: { select: { name: true } } } } },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        return {
            success: true,
            log: {
                ...(updatedLog as unknown as SymptomRecord),
                type: "patient" as const,
                notes: updatedLog.notes.map((note) => ({
                    id: note.id,
                    createdAt: note.createdAt,
                    text: note.text,
                    carerId: note.carerId,
                    carerName: note.carer?.user?.name ?? undefined,
                })),
            },
        };
    } catch (err: unknown) {
        console.error("Failed to update symptom log:", err);
        return { success: false, error: "Failed to update log" };
    }
}

export async function deleteSymptomLogAction(logId: string, patientId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const log = await prisma.symptomLog.findUnique({ where: { id: logId } });

        if (!log || log.patientId !== patientId) {
            return { success: false, error: "Log not found or unauthorized" };
        }

        await prisma.carerNote.deleteMany({ where: { logId: logId } });
        await prisma.symptomLog.delete({ where: { id: logId } });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete symptom log:", error);
        return { success: false, error: "Failed to delete log" };
    }
}
