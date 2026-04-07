import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CHAT_QUERY_PARAMS } from "../constants/chatConstants";
import { ChatNavigationParams } from "../types/chatTypes";

/**
 * Hook to handle deep-linking logic for CareCircleView.
 * It reads the URL parameters and provides the chat info.
 */
export const useChatDeepLink = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [deepLinkChat, setDeepLinkChat] = useState<ChatNavigationParams | null>(null);

    useEffect(() => {
        const chatId = searchParams.get(CHAT_QUERY_PARAMS.CHAT_ID);
        const type = searchParams.get(CHAT_QUERY_PARAMS.TYPE) as "thread" | "direct";
        const title = searchParams.get(CHAT_QUERY_PARAMS.TITLE) || undefined;

        if (chatId && type) {
            setDeepLinkChat({ chatId, type, title });
        } else {
            setDeepLinkChat(null);
        }
    }, [searchParams]);

    const clearDeepLink = () => {
        setDeepLinkChat(null);
        router.replace("/care-circle");
    };

    return { deepLinkChat, clearDeepLink };
};
