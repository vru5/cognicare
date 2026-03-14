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

export async function updateSymptomLog(logId: string, newText: string, patientId: string, isFromCarer: boolean = false, carerId?: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logId, newText, patientId, isFromCarer, carerId }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to update log:", err);
        return { success: false, error: "Failed to update log" };
    }
}

export async function addCarerComment(logId: string, text: string, carerId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs/comment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logId, text, carerId }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to add comment:", err);
        return { success: false, error: "Failed to add comment" };
    }
}

export async function createManualLog(patientId: string, rawText: string, isFromCarer: boolean = false, carerId?: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId, rawText, isFromCarer, carerId }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to create manual log:", err);
        return { success: false, error: "Failed to create log" };
    }
}

export async function deleteCarerLog(logId: string, carerId: string, patientId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logId, carerId, patientId }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to delete log:", err);
        return { success: false, error: "Failed to delete log" };
    }
}
export async function deleteCarerComment(commentId: string, carerId: string, patientId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs/comment`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ commentId, carerId, patientId }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to delete comment:", err);
        return { success: false, error: "Failed to delete comment" };
    }
}
