import { API_BASE_URL } from "@/constants/auth";
import { LogSummaryCard, BaseResponse, LogResponse, LogsResponse } from "../types/logTypes";

export async function createManualLog(patientId: string, rawText: string, isFromCarer: boolean = false, carerId?: string): Promise<LogResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId, rawText, isFromCarer, carerId }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to create manual log:", err);
        return { success: false, error: "Failed to create manual log" } as any;
    }
}

export async function getLogs(patientId: string, requesterId?: string, isCarer: boolean = false): Promise<LogsResponse> {
    try {
        const url = new URL(`${API_BASE_URL}/api/logs`);
        url.searchParams.append("patientId", patientId);
        if (requesterId) url.searchParams.append("requesterId", requesterId);
        if (isCarer) url.searchParams.append("isCarer", "true");

        const response = await fetch(url.toString());
        return await response.json();
    } catch (error: unknown) {
        console.error("Failed to fetch logs:", error);
        return { success: false, error: "Failed to fetch logs", logs: [] };
    }
}

export async function updateSymptomLog(logId: string, newText: string, patientId: string, isFromCarer: boolean = false, carerId?: string): Promise<LogResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logId, newText, patientId, isFromCarer, carerId }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to update log:", err);
        return { success: false, error: "Failed to update log" } as any;
    }
}

export async function addCarerNote(logId: string, text: string, carerId: string): Promise<LogResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs/comment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logId, text, carerId }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to add note:", err);
        return { success: false, error: "Failed to add note" } as any;
    }
}

// Keep addCarerComment for backward compatibility if needed, but it's now the same as addCarerNote
export const addCarerComment = addCarerNote;

export async function deleteSymptomLog(logId: string, patientId: string, isFromCarer: boolean, carerId?: string): Promise<BaseResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logId, patientId, isFromCarer, carerId }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to delete log:", err);
        return { success: false, error: "Failed to delete log" };
    }
}

export async function deleteCarerNote(noteId: string, carerId: string, patientId: string, isFromCarer: boolean = true): Promise<LogResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs/carer-note`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ noteId, carerId, patientId, isFromCarer }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to delete note:", err);
        return { success: false, error: "Failed to delete note" } as any;
    }
}

export async function deleteCarerLog(logId: string, carerId: string, patientId: string, isFromCarer: boolean = true): Promise<LogResponse> {
    return deleteCarerNote(logId, carerId, patientId, isFromCarer);
}

export async function deleteCarerComment(commentId: string, carerId: string, patientId: string, isFromCarer: boolean = true): Promise<LogResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logs/comment`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ commentId, carerId, patientId, isFromCarer }),
        });
        return await response.json();
    } catch (err: unknown) {
        console.error("Failed to delete note:", err);
        return { success: false, error: "Failed to delete note" } as any;
    }
}
