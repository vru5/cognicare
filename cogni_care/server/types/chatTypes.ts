export enum NotificationType {
    CHAT_MESSAGE = "CHAT_MESSAGE",
    THREAD_CREATED = "THREAD_CREATED",
}

export interface ChatNotificationPayload {
    chatId: string;
    type: "thread" | "direct";
    title?: string;
    logId?: string;
    note_id?: string;
}
