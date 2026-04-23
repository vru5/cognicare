import { CHAT_QUERY_PARAMS } from "../constants/chatConstants";
import { ChatNavigationParams, ChatNotificationData } from "../types/chatTypes";

/**
 * Parses push notification data into a standardized chat navigation object.
 */
export const parseChatNotificationPayload = (data: ChatNotificationData): ChatNavigationParams | null => {
    const chatId = data.chatId || data.chat_id;
    const type = (data.type || data.chat_type) as "thread" | "direct";
    const title = data.title || data.thread_title;

    if (chatId && type) {
        return { chatId, type, title };
    }

    return null;
};

/**
 * Builds the internal route string for a chat or thread.
 */
export const buildChatRoute = (params: ChatNavigationParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set(CHAT_QUERY_PARAMS.CHAT_ID, params.chatId);
    searchParams.set(CHAT_QUERY_PARAMS.TYPE, params.type);
    
    if (params.title) {
        searchParams.set(CHAT_QUERY_PARAMS.TITLE, params.title);
    }

    return `/care-circle?${searchParams.toString()}`;
};
