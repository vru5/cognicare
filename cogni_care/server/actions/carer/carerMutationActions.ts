import { prisma } from "../../lib/prisma.js";
import { ActionResponse } from "../../types/carerActions";

export async function markPatientAsViewedAction(carerProfileId: string, patientId: string): Promise<ActionResponse> {
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
