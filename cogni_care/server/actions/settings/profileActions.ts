import { prisma } from "../../lib/prisma";
import { ProfileResponse } from "../../types/settingActions";

export async function getFullProfileAction(userId: string): Promise<ProfileResponse> {
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
