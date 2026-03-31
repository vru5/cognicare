import { prisma } from "../../lib/prisma";
import { markPatientAsViewedAction } from "../carer/carerMutationActions";
import { sendPushNotificationAction } from "../../lib/notificationService";
import { LogActionResponse, CarerNoteWithUser } from "../../types/logActions";
import { SymptomRecord } from "../../types/logsApi";
import { getIO } from "../../lib/socket";

export async function createCarerNoteAction(patientId: string, carerId: string, text: string): Promise<LogActionResponse> {
    try {
        await markPatientAsViewedAction(carerId, patientId);

        const log = await prisma.carerNote.create({
            data: {
                patientId,
                carerId,
                text,
                logId: null,
            },
            include: {
                carer: { include: { user: { select: { name: true } } } },
            },
        });

        // Trigger push notification
        await sendPushNotificationAction(log.id);

        // Real-time notification
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
                notes: [],
                physical: null, mood: null, cognitive: null, sleep: null, social: null,
            },
        };
    } catch (error) {
        console.error("Failed to create carer note:", error);
        return { success: false, error: "Failed to create note" };
    }
}

export async function addCarerCommentAction(logId: string, carerId: string, text: string): Promise<LogActionResponse> {
    try {
        const existingLog = await prisma.symptomLog.findUnique({
            where: { id: logId },
            select: { patientId: true },
        });
        if (!existingLog) {
            return { success: false, error: "Log not found" };
        }
        const patientId = existingLog.patientId;
        await markPatientAsViewedAction(carerId, patientId);

        const note = await prisma.carerNote.create({
            data: {
                logId,
                carerId,
                text,
                patientId,
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

        await sendPushNotificationAction(note.id);

        try {
            const io = getIO();
            io.to(patientId).emit("new_notification", {
                type: "CARER_COMMENT",
                title: "New Comment",
                body: `${note.carer.user.name || "A carer"} commented on a log.`,
                data: { logId: logId }
            });
        } catch (err) {
            console.warn("[Socket] Failed to emit CARER_COMMENT notification:", err);
        }

        if (!note.log) {
            return { success: false, error: "Log not found" };
        }

        return {
            success: true,
            log: {
                ...(note.log as unknown as SymptomRecord),
                type: "patient" as const,
                notes: note.log.notes.map((c) => ({
                    id: c.id,
                    createdAt: c.createdAt,
                    text: c.text,
                    carerId: c.carerId,
                    patientId: c.patientId,
                    carerName: c.carer.user.name ?? undefined,
                })),
            },
        };
    } catch (error) {
        console.error("Failed to add carer comment:", error);
        return { success: false, error: "Failed to add comment" };
    }
}

export async function updateCarerNoteAction(noteId: string, carerId: string, text: string): Promise<LogActionResponse> {
    try {
        const carerNote = await prisma.carerNote.findUnique({
            where: { id: noteId },
        });

        if (!carerNote || carerNote.carerId !== carerId) {
            return { success: false, error: "Unauthorized or note not found" };
        }

        await markPatientAsViewedAction(carerId, carerNote.patientId);

        const updated = await prisma.carerNote.update({
            where: { id: noteId },
            data: { text },
            include: { carer: { include: { user: { select: { name: true } } } } }
        });

        try {
            const io = getIO();
            io.to(carerNote.patientId).emit("new_notification", {
                type: "CARER_LOG",
            });
            io.to(carerNote.patientId).emit("new_log", { patientId: carerNote.patientId });
        } catch (err) {
            console.warn("[Socket] Failed to emit CARER_LOG notification on update:", err);
        }

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
    } catch (err: unknown) {
        console.error("Failed to update carer note:", err);
        return { success: false, error: "Failed to update note" };
    }
}

export async function deleteCarerNoteAction(noteId: string, carerId: string, patientId: string): Promise<LogActionResponse | { success: boolean; error?: string }> {
    try {
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

        try {
            const io = getIO();
            io.to(patientId).emit("new_notification", {
                type: "CARER_LOG",
            });
            io.to(patientId).emit("new_log", { patientId });
        } catch (err) {
            console.warn("[Socket] Failed to emit CARER_LOG notification on delete:", err);
        }

        if (logId) {
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
                return {
                    success: true,
                    log: {
                        ...(updatedLog as unknown as SymptomRecord),
                        type: "patient" as const,
                        notes: updatedLog.notes.map((c) => ({
                            id: c.id,
                            createdAt: c.createdAt,
                            text: c.text,
                            carerId: c.carerId,
                            patientId: c.patientId,
                            carerName: c.carer.user.name ?? undefined,
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
