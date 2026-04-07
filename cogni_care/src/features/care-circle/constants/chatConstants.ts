export const CHAT_ENDPOINTS = {
    THREADS: "/api/chat/threads",
    DIRECT: "/api/chat/direct",
    MESSAGES: "/api/chat/messages",
    CONTACTS: "/api/chat/contacts",
    READ: "/api/chat/read",
    FROM_NOTE: "/api/chat/threads/from-note",
    RESOLVE: (threadId: string) => `/api/chat/threads/${threadId}/resolve`,
    PUSH_TOKEN: "/api/auth/push-token",
} as const;

export const CHAT_QUERY_PARAMS = {
    CHAT_ID: "chatId",
    TYPE: "type",
    TITLE: "title",
} as const;

export const CHAT_TYPES = {
    THREAD: "thread",
    DIRECT: "direct",
} as const;

export const CHAT_TABS = {
    THREADS: "threads",
    DIRECT: "direct",
} as const;

export const CHAT_STRINGS = {
    DIRECT_CHAT_FALLBACK: "Direct Chat",
    LOADING_DISCUSSIONS: "Loading discussions...",
    LOADING_CONTACTS: "Loading contacts...",
    NO_DISCUSSIONS: "No active discussions",
    NO_CONTACTS: "No contacts found",
    CONTACTS_ACCESS_HELP: "Caregivers must be granted access in Settings.",
    RESOLVE_CONFIRM: "Mark as resolved? This will delete the thread.",
    DELETE_NOTE_CONFIRM: "Delete this note?",
    DISCUSS_BUTTON: "Discuss",
    RESOLVE_BUTTON: "Resolve",
    CHAT_SUBTITLE: "Care Circle Chat",
    START_CONVERSATION: "Start a conversation",
    MESSAGE_PLACEHOLDER: "Share your message...",
} as const;
