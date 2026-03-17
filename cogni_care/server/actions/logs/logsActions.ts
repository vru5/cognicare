import { CarerNote, LogSumaryCard } from "@/features/logs/types/logSummaryCard";
import { prisma } from "../../lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { ApiError } from "next/dist/server/api-utils";
import { Analysis, SymptomRecord, SymptomLogUpdateData } from "../../types/logsApi";
import { markPatientAsViewedAction } from "../carer/carerActions";
import { sendPushNotificationAction } from "../../lib/notificationService";
import { Prisma } from "@prisma/client";
import { getIO } from "../../lib/socket";

type CarerNoteWithUser = Prisma.CarerNoteGetPayload<{
    include: {
        carer: {
            include: { user: { select: { name: true } } }
        }
    }
}>;

export async function getLogsAction(patientId: string, requesterProfileId?: string, isCarer: boolean = false) {
    try {
        // 1. Check permissions if requester is a carer
        if (isCarer && requesterProfileId) {
            const relation = await prisma.carersOnPatients.findUnique({
                where: {
                    carerId_patientId: {
                        carerId: requesterProfileId,
                        patientId: patientId,
                    }
                },
                select: { accessSymptomLogs: true }
            });

            if (!relation?.accessSymptomLogs) {
                // If access is revoked, return empty logs with a restricted flag
                return { success: true, logs: [], restricted: true };
            }
        }

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
            notes: log.notes.map((c) => ({
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
            notes: [], // Standalone logs start with no comments
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

            // Trigger push notification for independent log
            await sendPushNotificationAction(log.id);

            // Real-time notification via WebSocket
            try {
                const io = getIO();
                io.to(patientId).emit("new_notification", {
                    type: "CARER_LOG",
                    title: "New Note from Carer",
                    body: `${log.carer.user.name || "A carer"} added a new note.`,
                    data: { note_id: log.id }
                });
                io.to(patientId).emit("new_log", { patientId });
            } catch (err) {
                console.warn("[Socket] Failed to emit CARER_LOG notification:", err);
            }

            return {
                success: true,
                log: {
                    ...log,
                    rawText: log.text,
                    type: "carer" as const,
                    isFromCarer: true,
                    carerName: log.carer.user.name ?? "Carer",
                    carerId: log.carerId,
                    notes: [], // Independent notes start with no sub-comments
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

        // Real-time notification for new patient log (to carers)
        try {
            const io = getIO();
            // In a real app, you'd find all carers for this patient.
            // For now, we broadcast to a patient-specific room where carers might be listening
            // or we could broadcast to all carers connected.
            // Let's broadcast to the patient room; carers should join rooms of their patients.
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

        // 1. Try to find the log in SymptomLog or CarerNote
        const symptomLog = await prisma.symptomLog.findUnique({
            where: { id: logId },
        });

        if (symptomLog) {
            // Permission Check: Patients can edit patient logs, carers cannot edit patient logs
            if (isFromCarer) {
                return { success: false, error: "Carers cannot edit patient logs" };
            }

            if (symptomLog.patientId !== patientId) {
                return { success: false, error: "Unauthorized" };
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

            const logWithNotes = updatedLog as typeof updatedLog & { notes: CarerNote[] };

            return {
                success: true,
                log: {
                    ...(logWithNotes as unknown as SymptomRecord),
                    type: "patient" as const,
                    notes: logWithNotes.notes.map((c) => {
                        const note = c as unknown as CarerNoteWithUser;
                        return {
                            id: note.id,
                            createdAt: note.createdAt,
                            text: note.text,
                            carerId: note.carerId,
                            carerName: note.carer?.user?.name ?? undefined,
                        };
                    }),
                },
            };
        }

        // 2. Check CarerNote (standalone log)
        const carerNote = await prisma.carerNote.findUnique({
            where: { id: logId },
            include: { carer: { include: { user: { select: { name: true } } } } }
        });

        if (carerNote && !carerNote.logId) {
            // Permission Check: Carers can edit their logs, patients cannot edit carer logs
            if (!isFromCarer || carerNote.carerId !== carerId) {
                return { success: false, error: "Unauthorized or not your log" };
            }

            if (carerId) {
                await markPatientAsViewedAction(carerId, patientId);
            }

            const updated = await prisma.carerNote.update({
                where: { id: logId },
                data: { text: newText },
                include: { carer: { include: { user: { select: { name: true } } } } }
            });

            return {
                success: true,
                log: {
                    id: updated.id,
                    createdAt: updated.createdAt,
                    patientId: updated.patientId,
                    rawText: updated.text,
                    isFromCarer: true,
                    type: "carer" as const,
                    carerName: updated.carer.user.name ?? "Carer",
                    carerId: updated.carerId,
                    notes: [],
                    physical: null, mood: null, cognitive: null, sleep: null, social: null,
                }
            };
        }

        return { success: false, error: "Log not found" };
    } catch (err: unknown) {
        console.error("Failed to update log:", err);
        return { success: false, error: "Failed to update log" };
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

        // Real-time notification for comment
        try {
            const io = getIO();
            io.to(patientIdFromLog).emit("new_notification", {
                type: "CARER_COMMENT",
                title: "New Comment",
                body: `${note.carer.user.name || "A carer"} commented on a log.`,
                data: { logId: logId }
            });
        } catch (err) {
            console.warn("[Socket] Failed to emit CARER_COMMENT notification:", err);
        }

        return {
            success: true,
            log: {
                ...note.log,
                type: "patient" as const,
                carerName: undefined, // SymptomLog doesn't have a single creator carer
                notes: note.log?.notes.map((c) => ({
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

export async function deleteSymptomLogAction(logId: string, patientId: string, isFromCarer: boolean) {
    try {
        // Permission Check: Only patients can delete patient logs
        if (isFromCarer) {
            return { success: false, error: "Carers cannot delete patient logs" };
        }

        const log = await prisma.symptomLog.findUnique({
            where: { id: logId }
        });

        if (!log || log.patientId !== patientId) {
            return { success: false, error: "Log not found or unauthorized" };
        }

        // Delete all associated notes first (Prisma doesn't have cascade in some configs, safer to do manually or verify schema)
        await prisma.carerNote.deleteMany({
            where: { logId: logId }
        });

        await prisma.symptomLog.delete({
            where: { id: logId }
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete symptom log:", error);
        return { success: false, error: "Failed to delete log" };
    }
}

export async function deleteCarerNoteAction(noteId: string, carerId: string, patientId: string, isFromCarer: boolean) {
    try {
        // Permission Check: Patients cannot delete carer notes
        if (!isFromCarer) {
            return { success: false, error: "Patients cannot delete carer logs/notes" };
        }

        const note = await prisma.carerNote.findUnique({
            where: { id: noteId },
            include: { log: true }
        });

        if (!note || note.carerId !== carerId || note.patientId !== patientId) {
            return { success: false, error: "Note not found or unauthorized" };
        }

        const logId = note.logId;

        await prisma.carerNote.delete({
            where: { id: noteId }
        });

        if (logId) {
            // Fetch updated log to return to frontend if it was a comment
            const updatedLog = await prisma.symptomLog.findUnique({
                where: { id: logId },
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
                        notes: logWithNotes.notes.map((c: CarerNote) => {
                            const note = c as unknown as CarerNoteWithUser;
                            return {
                                id: note.id,
                                createdAt: note.createdAt,
                                text: note.text,
                                carerId: note.carerId,
                                carerName: note.carer?.user?.name ?? undefined,
                            };
                        }),
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

