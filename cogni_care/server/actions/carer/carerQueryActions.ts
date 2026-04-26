import { prisma } from "../../lib/prisma.js";
import { CarerPatientsResponse } from "../../types/carerActions";

export async function getCarerPatientsAction(carerProfileId: string): Promise<CarerPatientsResponse> {
    console.log(`[CarerQuery] getCarerPatientsAction called for ${carerProfileId}`);
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
                accessSymptomLogs: rel.accessSymptomLogs,
                accessCareCircle: rel.accessCareCircle
            };
        });

        return { success: true, patients };
    } catch (error: unknown) {
        console.error("Failed to fetch carer patients:", error);
        return { success: false, error: "Failed to fetch patients" };
    }
}

export async function getCarerPatientsWithCareCircleAction(carerProfileId: string): Promise<any> {
    console.log(`[CarerQuery] getCarerPatientsWithCareCircleAction called for ${carerProfileId}`);
    try {
        // Resolve User ID for unread filtering
        const carerProfile = await prisma.profileCarer.findUnique({ where: { id: carerProfileId } });
        const userId = carerProfile?.userId || "";

        const relations = await prisma.carersOnPatients.findMany({
            where: { 
                carerId: carerProfileId,
                accessCareCircle: true
            },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        console.log(`[CarerQuery] Found ${relations.length} relations for carer ${carerProfileId}:`);
        relations.forEach(r => {
            console.log(` - Patient ${r.patientId}: accessSymptomLogs=${r.accessSymptomLogs}, accessCareCircle=${r.accessCareCircle}`);
        });

        const patients = await Promise.all(relations.map(async (rel) => {
            // Fetch unread count for this specific direct chat
            const chat = await prisma.directChat.findUnique({
                where: {
                    patientId_carerId: {
                        patientId: rel.patientId,
                        carerId: rel.carerId
                    }
                }
            });

            let unreadCount = 0;
            if (chat) {
                unreadCount = await prisma.chatMessage.count({
                    where: {
                        directChatId: chat.id,
                        senderId: { not: userId }, // Exclude carer's own messages
                        createdAt: { gt: (chat as any).carerLastReadAt }
                    }
                });
            }

            return {
                id: rel.patient.id,
                name: rel.patient.user.name || "Unknown Patient",
                hasNewLog: false,
                accessSymptomLogs: rel.accessSymptomLogs,
                accessCareCircle: rel.accessCareCircle,
                unreadCount
            };
        }));

        return { success: true, patients };
    } catch (error: unknown) {
        console.error("Failed to fetch carer care-circle patients:", error);
        return { success: false, error: "Failed to fetch contacts", patients: [] };
    }
}
