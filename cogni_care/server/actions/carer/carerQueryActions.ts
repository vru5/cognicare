import { prisma } from "../../lib/prisma.js";
import { CarerPatientsResponse } from "../../types/carerActions";

export async function getCarerPatientsAction(carerProfileId: string): Promise<CarerPatientsResponse> {
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
