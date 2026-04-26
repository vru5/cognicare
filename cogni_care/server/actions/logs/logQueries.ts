import { prisma } from "../../lib/prisma";
import { LogsActionResponse } from "../../types/logActions";
import { SymptomRecord } from "../../types/logsApi";

export async function getLogsAction(patientId: string, requesterProfileId?: string, isCarer: boolean = false): Promise<LogsActionResponse> {
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
                    carer: {
                        include: { user: { select: { name: true } } },
                    },
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

        const formattedSymptomLogs: SymptomRecord[] = await Promise.all(symptomLogs.map(async ({ carer: logCarer, notes: logNotes, ...log }) => {
            const notes = await Promise.all(logNotes.map(async (c) => {
                const relation = await prisma.carersOnPatients.findUnique({
                    where: {
                        carerId_patientId: {
                            carerId: c.carerId,
                            patientId: c.patientId,
                        }
                    },
                    select: { accessCareCircle: true }
                });

                return {
                    id: c.id,
                    createdAt: c.createdAt,
                    text: c.text,
                    carerId: c.carerId,
                    patientId: c.patientId,
                    carerName: c.carer.user.name ?? undefined,
                    accessCareCircle: relation?.accessCareCircle ?? true,
                };
            }));

            return {
                ...(log as unknown as SymptomRecord),
                type: "patient" as const,
                carerName: logCarer?.user?.name ?? undefined,
                notes,
            };
        }));

        const formattedCarerLogs = await Promise.all(carerNotes.map(async (log) => {
            const relation = await prisma.carersOnPatients.findUnique({
                where: {
                    carerId_patientId: {
                        carerId: log.carerId,
                        patientId: log.patientId,
                    }
                },
                select: { accessCareCircle: true }
            });

            return {
                id: log.id,
                createdAt: log.createdAt,
                patientId: log.patientId,
                rawText: log.text,
                isFromCarer: true,
                type: "carer" as const,
                carerName: log.carer.user.name ?? undefined,
                carerId: log.carerId,
                accessCareCircle: relation?.accessCareCircle ?? true,
                notes: [], // Standalone logs start with no comments
                // Add null pillars for UI compatibility if needed
                physical: null,
                mood: null,
                cognitive: null,
                sleep: null,
                social: null,
            };
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
