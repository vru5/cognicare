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
                Extract the symptoms into the following pillars: physical, mood, cognitive, sleep, social.

                For each pillar, provide TWO fields in the JSON:
                1. The pillar name (e.g., 'physical'): A single word or very short phrase describing the symptom (e.g., 'Headache', 'Happy').
                2. The severity field (e.g., 'physicalSeverity'): A number from 1 to 10 evaluating how severe the symptom is based on the language used.

                If a category is not mentioned or the input is nonsensical/gibberish, return null for the string field and 0 or null for the severity field.
                DO NOT make up information. If the input is just random characters or unrelated to health, return null for ALL fields.
                Return output strictly as a JSON object, for example:
                {
                "physical": "Headache", "physicalSeverity": 8,
                "sleep": null, "sleepSeverity": null
                }

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

        const hasAnalysis = Boolean(
            analysis.physical ||
            analysis.mood ||
            analysis.cognitive ||
            analysis.sleep ||
            analysis.social
        );

        if (!hasAnalysis) {
            return {
                success: false,
                error: "We couldn't detect any specific health symptoms or updates in this entry. Please try being more specific."
            };
        }

        const log = await prisma.symptomLog.create({
            data: {
                patientId,
                rawText,
                physical: analysis.physical || null,
                physicalSeverity: analysis.physicalSeverity || null,
                mood: analysis.mood || null,
                moodSeverity: analysis.moodSeverity || null,
                cognitive: analysis.cognitive || null,
                cognitiveSeverity: analysis.cognitiveSeverity || null,
                sleep: analysis.sleep || null,
                sleepSeverity: analysis.sleepSeverity || null,
                social: analysis.social || null,
                socialSeverity: analysis.socialSeverity || null,
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
                Extract the symptoms into the following pillars: physical, mood, cognitive, sleep, social.

                For each pillar, provide TWO fields in the JSON:
                1. The pillar name (e.g., 'physical'): A single word or very short phrase describing the symptom (e.g., 'Headache', 'Happy').
                2. The severity field (e.g., 'physicalSeverity'): A number from 1 to 10 evaluating how severe the symptom is based on the language used.

                If a category is not mentioned or the input is nonsensical/gibberish, return null for the string field and 0 or null for the severity field.
                DO NOT make up information. If the input is just random characters or unrelated to health, return null for ALL fields.
                Return output strictly as a JSON object, for example:
                {
                "physical": "Headache", "physicalSeverity": 8,
                "sleep": null, "sleepSeverity": null
                }

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
                    physicalSeverity: analysis.physicalSeverity || null,
                    mood: analysis.mood || null,
                    moodSeverity: analysis.moodSeverity || null,
                    cognitive: analysis.cognitive || null,
                    cognitiveSeverity: analysis.cognitiveSeverity || null,
                    sleep: analysis.sleep || null,
                    sleepSeverity: analysis.sleepSeverity || null,
                    social: analysis.social || null,
                    socialSeverity: analysis.socialSeverity || null,
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

        // Real-time notification for update
        try {
            const io = getIO();
            io.to(patientId).emit("new_notification", {
                type: "PATIENT_LOG",
            });
            io.to(patientId).emit("new_log", { patientId });
        } catch (err) {
            console.warn("[Socket] Failed to emit PATIENT_LOG notification on update:", err);
        }

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

export async function deleteSymptomLogAction(logId: string, patientId: string, requesterId?: string, isCarer: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
        const log = await prisma.symptomLog.findUnique({ where: { id: logId } });

        if (!log || log.patientId !== patientId) {
            return { success: false, error: "Log not found or unauthorized" };
        }

        // Authorization: Carers delete their own, Patients delete their own
        if (isCarer) {
            if (!log.isFromCarer || log.carerId !== requesterId) {
                return { success: false, error: "Carers can only delete logs they created" };
            }
        } else {
            if (log.isFromCarer) {
                return { success: false, error: "Patients cannot delete carer logs" };
            }
        }

        await prisma.carerNote.deleteMany({ where: { logId: logId } });
        await prisma.symptomLog.delete({ where: { id: logId } });

        // Real-time notification for delete
        try {
            const io = getIO();
            io.to(patientId).emit("new_notification", {
                type: "PATIENT_LOG",
            });
            io.to(patientId).emit("new_log", { patientId });
        } catch (err) {
            console.warn("[Socket] Failed to emit PATIENT_LOG notification on delete:", err);
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to delete symptom log:", error);
        return { success: false, error: "Failed to delete log" };
    }
}
