import { API_BASE_URL } from "@/constants/auth";

export async function transcribeAudio(base64Audio: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/brain-dump/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Audio }),
    });
    return await response.json();
  } catch (error: unknown) {
    console.error("Failed to call transcribe API:", error);
    return { success: false, error: "Failed to connect to transcription service" };
  }
}
