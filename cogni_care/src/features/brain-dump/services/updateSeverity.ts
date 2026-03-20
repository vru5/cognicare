import { API_BASE_URL } from "@/constants/auth";
import { SymptomPillar } from "@/features/logs/types/logTypes";

export async function updateBrainDumpSeverity(logId: string, pillar: SymptomPillar, severity: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/brain-dump/severity`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logId, pillar, severity }),
    });
    return await response.json();
  } catch (err: unknown) {
    console.error("Failed to update severity:", err);
    return { success: false, error: "Failed to connect to processing service" };
  }
}
