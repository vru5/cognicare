import { API_BASE_URL } from "@/constants/auth";
import { ChatThread, DirectChat, ChatMessage } from "../types/chatTypes";
import { CHAT_ENDPOINTS } from "../constants/chatConstants";

export const createThreadFromNote = async (noteId: string, patientId: string, authorCarerId: string) => {
    const res = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.FROM_NOTE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, patientId, authorCarerId }),
    });
    return res.json();
};

export const resolveThread = async (threadId: string) => {
    const res = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.RESOLVE(threadId)}`, {
        method: "POST",
    });
    return res.json();
};

export const getOrCreateDirectChat = async (patientId: string, carerId: string) => {
    const res = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.DIRECT}?patientId=${patientId}&carerId=${carerId}`);
    return res.json();
};

export const sendMessage = async (data: {
    senderId: string;
    content: string;
    threadId?: string;
    directChatId?: string;
}) => {
    const res = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.MESSAGES}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getContacts = async (profileId: string, isCarer: boolean) => {
    const res = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.CONTACTS}?profileId=${profileId}&isCarer=${isCarer}`);
    return res.json();
};

export const getThreads = async (profileId: string, isCarer: boolean) => {
    const res = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.THREADS}?profileId=${profileId}&isCarer=${isCarer}`);
    return res.json();
};

export const getMessages = async (params: { threadId?: string; directChatId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.MESSAGES}?${query}`);
    return res.json();
};
