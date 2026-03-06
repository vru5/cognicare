/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function processBrainDump(rawText: string, patientId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/brain-dump/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText, patientId }),
    });
    return await response.json();
  } catch (err: any) {
    console.error("Failed to call process API:", err);
    return { success: false, error: "Failed to connect to processing service" };
  }
}
