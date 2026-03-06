const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function getLogs(patientId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs?patientId=${patientId}`);
        return await response.json();
    } catch (error: any) {
        console.error("Failed to fetch logs:", error);
        return { success: false, error: "Failed to fetch logs" };
    }
}

export async function updateSymptomLog(logId: string, newText: string, patientId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logId, newText, patientId }),
        });
        return await response.json();
    } catch (err: any) {
        console.error("Failed to update log:", err);
        return { success: false, error: "Failed to update log" };
    }
}
