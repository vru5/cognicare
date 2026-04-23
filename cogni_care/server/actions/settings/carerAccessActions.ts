import { prisma } from "../../lib/prisma";
import { getIO } from "../../lib/socket";
import { CarersResponse, UpdateAccessResponse } from "../../types/settingActions";

export async function getPatientCarersAction(patientProfileId: string): Promise<CarersResponse> {
    try {
        // Resolve User ID for unread filtering
        const patientProfile = await prisma.profilePatient.findUnique({ where: { id: patientProfileId } });
        const userId = patientProfile?.userId || "";

        const relations = await prisma.carersOnPatients.findMany({
            where: { patientId: patientProfileId },
            include: {
                carer: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            }
                        }
                    }
                }
            }
        });

        const carers = await Promise.all(relations.map(async (rel) => {
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
                        senderId: { not: userId }, // Exclude patient's own messages
                        createdAt: { gt: (chat as any).patientLastReadAt }
                    }
                });
            }

            return {
                id: rel.carer.id,
                name: rel.carer.user.name || "Unknown Carer",
                email: rel.carer.user.email,
                accessSymptomLogs: rel.accessSymptomLogs,
                accessCareCircle: rel.accessCareCircle,
                unreadCount
            };
        }));

        return { success: true, carers };
    } catch (error: unknown) {
        console.error("Failed to fetch patient carers:", error);
        return { success: false, error: "Failed to fetch carers" };
    }
}

export async function updateCarerAccessAction(
    patientProfileId: string,
    carerProfileId: string,
    data: { accessSymptomLogs?: boolean; accessCareCircle?: boolean }
): Promise<UpdateAccessResponse> {
    try {
        await prisma.carersOnPatients.update({
            where: {
                carerId_patientId: {
                    carerId: carerProfileId,
                    patientId: patientProfileId,
                }
            },
            data: {
                ...(data.accessSymptomLogs !== undefined && { accessSymptomLogs: data.accessSymptomLogs }),
                ...(data.accessCareCircle !== undefined && { accessCareCircle: data.accessCareCircle }),
            }
        });

        // Emit WebSocket event for real-time refresh
        try {
            const io = getIO();
            io.to(carerProfileId).emit("permission_updated", {
                patientId: patientProfileId,
                accessSymptomLogs: data.accessSymptomLogs,
                accessCareCircle: data.accessCareCircle
            });
            console.log(`[Socket] Emitted permission_updated to carer: ${carerProfileId}`);
        } catch (err) {
            console.warn("[Socket] Failed to emit permission_updated:", err);
        }

        return { success: true };
    } catch (error: unknown) {
        console.error("Failed to update carer access:", error);
        return { success: false, error: "Failed to update access" };
    }
}
