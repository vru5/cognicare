export interface NotificationData {
    logId?: string;
    note_id?: string;
    [key: string]: unknown; // Removed any
}

export interface NotificationRecord {
    id: string;
    userId: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string | Date;
    data?: NotificationData | string;
}
