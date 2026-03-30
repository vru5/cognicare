import { prisma } from "../../lib/prisma";
import { LogsActionResponse } from "../../types/logActions";

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

        const formattedSymptomLogs = symptomLogs.map((log) => ({
            ...log,
            type: "patient" as const,
            carerName: (log as any).carer?.user?.name ?? undefined,
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
