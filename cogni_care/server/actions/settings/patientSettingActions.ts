import { prisma } from "../../lib/prisma";
import { getIO } from "../../lib/socket";

export async function getPatientCarersAction(patientProfileId: string) {
    try {
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

        const carers = relations.map(rel => ({
            id: rel.carer.id,
            name: rel.carer.user.name || "Unknown Carer",
            email: rel.carer.user.email,
            accessSymptomLogs: rel.accessSymptomLogs,
            accessCareCircle: rel.accessCareCircle,
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
) {
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

export async function getFullProfileAction(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                phone: true,
                role: true,
                patient: { select: { id: true } },
                carer:  { select: { id: true } },
            },
        });

        if (!user) return { success: false, error: "User not found" };

        return {
            success: true,
            profile: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profileId: user.patient?.id ?? user.carer?.id ?? null,
            },
        };
    } catch (error: unknown) {
        console.error("Failed to fetch profile:", error);
        return { success: false, error: "Failed to load profile" };
    }
}
