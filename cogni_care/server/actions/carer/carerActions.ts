import { prisma } from "../../lib/prisma.js";

export async function getCarerPatientsAction(carerProfileId: string) {
    try {
        const relations = await prisma.carersOnPatients.findMany({
            where: { 
                carerId: carerProfileId,
                accessSymptomLogs: true
            },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        },
                        logs: {
                            orderBy: { createdAt: "desc" },
                            take: 1,
                            select: {
                                createdAt: true
                            }
                        }
                    }
                }
            }
        });

        const patients = relations.map(rel => {
            const lastLog = rel.patient.logs[0];
            const hasNewLog = lastLog ? new Date(lastLog.createdAt) > new Date(rel.lastViewedAt) : false;

            return {
                id: rel.patient.id,
                name: rel.patient.user.name || "Unknown Patient",
                hasNewLog,
                accessSymptomLogs: rel.accessSymptomLogs
            };
        });

        return { success: true, patients };
    } catch (error: unknown) {
        console.error("Failed to fetch carer patients:", error);
        return { success: false, error: "Failed to fetch patients" };
    }
}

export async function markPatientAsViewedAction(carerProfileId: string, patientId: string) {
    try {
        await prisma.carersOnPatients.update({
            where: {
                carerId_patientId: {
                    carerId: carerProfileId,
                    patientId: patientId
                }
            },
            data: {
                lastViewedAt: new Date()
            }
        });
        return { success: true };
    } catch (error: unknown) {
        console.error("Failed to mark patient as viewed:", error);
        return { success: false, error: "Failed to update viewed status" };
    }
}
