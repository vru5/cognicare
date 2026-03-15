/* eslint-disable @typescript-eslint/no-explicit-any */
import { CarerNote, LogSumaryCard } from "@/features/logs/types/logSummaryCard";
import { prisma } from "../../lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { ApiError } from "next/dist/server/api-utils";
import { Analysis, SymptomRecord, SymptomLogUpdateData } from "../../types/logsApi";
import { markPatientAsViewedAction } from "../carer/carerActions";
import { sendPushNotificationAction } from "../../lib/notificationService";

export async function getLogsAction(patientId: string) {
    try {
        const [symptomLogs, carerNotes] = await Promise.all([
            prisma.symptomLog.findMany({
                where: { patientId },
                include: {
                    notes: {
                        include: {
                            carer: {
                                include: { user: { select: { name: true } } },
                            },
                        },
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.carerNote.findMany({
                where: { patientId, logId: null },
                include: {
                    carer: {
                        include: { user: { select: { name: true } } },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const formattedSymptomLogs = symptomLogs.map((log) => ({
            ...log,
            type: "patient" as const,
            comments: log.notes.map((c) => ({
                id: c.id,
                createdAt: c.createdAt,
                text: c.text,
                carerId: c.carerId,
                carerName: c.carer.user.name ?? undefined,
            })),
        }));

        const formattedCarerLogs = carerNotes.map((log) => ({
            id: log.id,
            createdAt: log.createdAt,
            patientId: log.patientId,
            rawText: log.text,
            isFromCarer: true,
            type: "carer" as const,
            carerName: log.carer.user.name ?? undefined,
            carerId: log.carerId,
            // Add null pillars for UI compatibility if needed
            physical: null,
            mood: null,
            cognitive: null,
            sleep: null,
            social: null,
        }));

        const allLogs = [...formattedSymptomLogs, ...formattedCarerLogs].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        return { success: true, logs: allLogs };
    } catch (error: unknown) {
        console.error("Failed to fetch logs:", error);
        return { success: false, error: "Failed to fetch logs" };
    }
}

export async function createManualLogAction(data: {
    patientId: string;
    rawText: string;
    isFromCarer?: boolean;
    carerId?: string;
}) {
    try {
        const { patientId, rawText, isFromCarer = false, carerId } = data;

        if (isFromCarer && carerId) {
            // Mark patient as viewed for this carer since they are interacting with it
            await markPatientAsViewedAction(carerId, patientId);

            const log = await prisma.carerNote.create({
                data: {
                    patientId,
                    carerId,
                    text: rawText,
                    logId: null,
                },
                include: {
                    carer: { include: { user: { select: { name: true } } } },
                },
            });
            return {
                success: true,
                log: {
                    ...log,
                    rawText: log.text,
                    type: "carer" as const,
                    isFromCarer: true,
                    carerName: log.carer.user.name ?? "Carer",
                    carerId: log.carerId,
                    physical: null,
                    mood: null,
                    cognitive: null,
                    sleep: null,
                    social: null,
                },
            };
        }

        let analysis: Partial<Analysis> = {};

        // Disable AI analysis for carer logs even if they are stored in the patient table for some reason
        const apiKey = isFromCarer ? "" : (process.env.GEMINI_API_KEY || "").trim();
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
                        console.warn(
                            "Gemini 2.5 is overloaded, falling back to 1.5-flash...",
                        );
                        const fallbackModel = genAI.getGenerativeModel({
                            model: "gemini-1.5-flash",
                        });
                        result = await fallbackModel.generateContent(prompt);
                    } else {
                        throw apiErr;
                    }
                }
                let responseText = result.response.text();
                responseText = responseText
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .trim();
                const parsedAnalysis = JSON.parse(responseText || "{}") as Analysis;
                analysis = parsedAnalysis;
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
            include: {
                notes: true,
            },
        });

        return {
            success: true,
            log: { ...log, type: "patient" as const, comments: [] },
        };
    } catch (error) {
        console.error("Failed to create manual log:", error);
        return { success: false, error: "Failed to create log" };
    }
}

export async function updateSymptomLogAction(
    logId: string,
    data: {
        newText: string;
        patientId: string;
        isFromCarer?: boolean;
        carerId?: string;
    },
) {
    try {
        const { newText, patientId, isFromCarer = false, carerId } = data;

        const existingLog = await prisma.symptomLog.findUnique({
            where: { id: logId },
        });

        if (!existingLog || existingLog.patientId !== patientId) {
            return { success: false, error: "Log not found or unauthorized" };
        }

        if (isFromCarer) {
            // Update viewed status if we have the carerId
            if (carerId) {
                await markPatientAsViewedAction(carerId, patientId);
            }
            // Skip AI analysis for carer notes/updates
            const updatedLog = await prisma.symptomLog.update({
                where: { id: logId },
                data: { rawText: newText },
                include: {
                    notes: {
                        include: {
                            carer: { include: { user: { select: { name: true } } } },
                        },
                    },
                },
            });

            // Cast to include notes property that TypeScript might struggle to infer correctly from prisma.update
            const logWithNotes = updatedLog as typeof updatedLog & { notes: CarerNote[] };

            return {
                success: true,
                log: {
                    ...(logWithNotes as unknown as SymptomRecord),
                    type: "patient" as const,
                    comments: logWithNotes.notes.map((c) => ({
                        id: c.id,
                        createdAt: c.createdAt,
                        text: c.text,
                        carerId: c.carerId,
                        carerName: (c as any).carer?.user?.name ?? undefined,
                    })),
                },
            };
        }

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

        let updateData: SymptomLogUpdateData = { rawText: newText };

        try {
            let result;
            try {
                result = await model.generateContent(prompt);
            } catch (err: unknown) {
                const apiErr = err as ApiError;
                if (apiErr?.message?.includes("503")) {
                    console.warn(
                        "Gemini 2.5 is overloaded, falling back to 1.5-flash...",
                    );
                    const fallbackModel = genAI.getGenerativeModel({
                        model: "gemini-1.5-flash",
                    });
                    result = await fallbackModel.generateContent(prompt);
                } else {
                    throw apiErr;
                }
            }
            let responseText = result.response.text();
            responseText = responseText
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
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

        const updatedLog = await prisma.symptomLog.update({
            where: { id: logId },
            data: updateData,
            include: {
                notes: {
                    include: { carer: { include: { user: { select: { name: true } } } } },
                },
            },
        });

        const logWithNotes = updatedLog as typeof updatedLog & { notes: CarerNote[] };

        return {
            success: true,
            log: {
                ...(logWithNotes as unknown as SymptomRecord),
                type: "patient" as const,
                comments: logWithNotes.notes.map((c) => ({
                    id: c.id,
                    createdAt: c.createdAt,
                    text: c.text,
                    carerId: c.carerId,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    carerName: (c as any).carer?.user?.name ?? undefined,
                })),
            },
        };
    } catch (err: unknown) {
        console.error("Failed to update log:", err);
        return { success: false, error: "Failed to update log processing text" };
    }
}

export async function addCarerCommentAction(
    logId: string,
    data: { text: string; carerId: string },
) {
    try {
        const { text, carerId } = data;

        // Mark patient as viewed since the carer is commenting
        const existingLog = await prisma.symptomLog.findUnique({
            where: { id: logId },
            select: { patientId: true },
        });
        if (!existingLog) {
            return { success: false, error: "Log not found" };
        }
        const patientIdFromLog = existingLog.patientId;
        await markPatientAsViewedAction(carerId, patientIdFromLog);

        const note = await prisma.carerNote.create({
            data: {
                logId,
                carerId,
                text,
                patientId: patientIdFromLog,
            },
            include: {
                carer: { include: { user: { select: { name: true } } } },
                log: {
                    include: {
                        notes: {
                            include: {
                                carer: { include: { user: { select: { name: true } } } },
                            },
                            orderBy: { createdAt: "asc" },
                        },
                    },
                },
            },
        });

        // Trigger push notification via Supabase Edge Function
        await sendPushNotificationAction(note.id);

        return {
            success: true,
            log: {
                ...note.log,
                type: "patient" as const,
                carerName: undefined, // SymptomLog doesn't have a single creator carer
                comments: note.log?.notes.map((c) => ({
                    id: c.id,
                    createdAt: c.createdAt,
                    text: c.text,
                    carerId: c.carerId,
                    carerName: c.carer.user.name ?? undefined,
                })) || [],
            },
        };
    } catch (error) {
        console.error("Failed to add carer comment:", error);
        return { success: false, error: "Failed to add comment" };
    }
}

export async function deleteCarerNoteAction(noteId: string, carerId: string, patientId: string) {
    try {
        const note = await prisma.carerNote.findUnique({
            where: { id: noteId },
            include: { log: true }
        });

        if (!note || note.carerId !== carerId || note.patientId !== patientId) {
            return { success: false, error: "Note not found or unauthorized" };
        }

        await prisma.carerNote.delete({
            where: { id: noteId }
        });

        if (note.logId) {
            // Fetch updated log to return to frontend if it was a comment
            const updatedLog = await prisma.symptomLog.findUnique({
                where: { id: note.logId },
                include: {
                    notes: {
                        include: {
                            carer: { include: { user: { select: { name: true } } } },
                        },
                        orderBy: { createdAt: "asc" },
                    },
                },
            });

            if (updatedLog) {
                const logWithNotes = updatedLog as typeof updatedLog & { notes: CarerNote[] };
                return {
                    success: true,
                    log: {
                        ...(logWithNotes as unknown as SymptomRecord),
                        type: "patient" as const,
                        comments: logWithNotes.notes.map((c: CarerNote) => ({
                            id: c.id,
                            createdAt: c.createdAt,
                            text: c.text,
                            carerId: c.carerId,
                            carerName: (c as any).carer?.user?.name ?? undefined,
                        })),
                    },
                };
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to delete carer note:", error);
        return { success: false, error: "Failed to delete note" };
    }
}
