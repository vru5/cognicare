export const NOTIFICATION_TYPES = {
    CHAT_MESSAGE: "CHAT_MESSAGE",
    THREAD_CREATED: "THREAD_CREATED",
};

export const NOTIFICATION_TEMPLATES = {
    THREAD_CREATED_TITLE: "New Discussion",
    THREAD_CREATED_BODY: (senderName: string, text: string) => 
        `${senderName} started a discussion about your note: "${text.substring(0, 30)}..."`,
    DIRECT_MESSAGE_TITLE: (senderName: string) => `New message from ${senderName}`,
    THREAD_MESSAGE_TITLE: (threadTitle: string) => `New message in ${threadTitle}`,
};
