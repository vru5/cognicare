export interface ChatMessage {
    id: string;
    createdAt: string;
    content: string;
    senderId: string;
    threadId?: string;
    directChatId?: string;
    sender: {
        name: string | null;
        role: string | null;
    };
}

export interface ChatThread {
    id: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    isResolved: boolean;
    patientId: string;
    authorCarerId: string;
    noteId?: string;
    messages?: ChatMessage[];
}

export interface DirectChat {
    id: string;
    createdAt: string;
    updatedAt: string;
    patientId: string;
    carerId: string;
    messages?: ChatMessage[];
}

export interface ChatNavigationParams {
    chatId: string;
    type: "thread" | "direct";
    title?: string;
}

export interface ChatNotificationData {
    chatId?: string;
    chat_id?: string;
    type?: string;
    chat_type?: string;
    title?: string;
    thread_title?: string;
    message?: string;
    logId?: string;
    note_id?: string;
}
export interface ChatInterfaceProps {
    chatId: string;
    type: "thread" | "direct";
    title: string;
    onBack: () => void;
}
