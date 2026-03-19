import { prisma } from "../../lib/prisma.js";

export async function updateLogSeverityAction(logId: string, pillar: string, severity: number) {
  try {
    const severityField = `${pillar}Severity`;
    const updatedLog = await prisma.symptomLog.update({
      where: { id: logId },
      data: {
        [severityField]: severity,
      },
    });
    return { success: true, log: updatedLog };
  } catch (error) {
    console.error("Failed to update severity:", error);
    return { success: false, error: "Failed to update severity score" };
  }
}
