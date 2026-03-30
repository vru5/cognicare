import { API_BASE_URL } from "@/constants/auth";

export async function processBrainDump(rawText: string, patientId: string, isFromCarer: boolean = false, carerId?: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/brain-dump/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText, patientId, isFromCarer, carerId }),
    });
    return await response.json();
  } catch (err: unknown) {
    console.error("Failed to call process API:", err);
    return { success: false, error: "Failed to connect to processing service" };
  }
}
