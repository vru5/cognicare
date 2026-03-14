import { API_BASE_URL } from "@/constants/auth";

export async function getLogs(patientId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs?patientId=${patientId}`);
        return await response.json();
    } catch (error: unknown) {
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
    } catch (err: unknown) {
        console.error("Failed to update log:", err);
        return { success: false, error: "Failed to update log" };
    }
}

export async function addCarerComment(logId: string, carerComment: string, patientId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logId, carerComment, patientId }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to add comment:", err);
        return { success: false, error: "Failed to add comment" };
    }
}

export async function createManualLog(patientId: string, rawText: string, isFromCarer: boolean = false) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId, rawText, isFromCarer }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to create manual log:", err);
        return { success: false, error: "Failed to create log" };
    }
}
