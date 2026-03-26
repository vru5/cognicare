import { prisma } from "../../lib/prisma.js";
import { getIO } from "../../lib/socket.js";

export async function updateLogSeverityAction(logId: string, pillar: string, severity: number) {
  try {
    const severityField = `${pillar}Severity`;
    const updatedLog = await prisma.symptomLog.update({
      where: { id: logId },
      data: {
        [severityField]: severity,
      },
    });

    // Real-time notification for severity update
    try {
      const io = getIO();
      io.to(updatedLog.patientId).emit("new_notification", {
        type: "PATIENT_LOG",
      });
      io.to(updatedLog.patientId).emit("new_log", { patientId: updatedLog.patientId });
    } catch (err) {
      console.warn("[Socket] Failed to emit notification for severity update:", err);
    }

    return { success: true, log: { ...updatedLog, type: "patient" as const } };
  } catch (error) {
    console.error("Failed to update severity:", error);
    return { success: false, error: "Failed to update severity score" };
  }
}
