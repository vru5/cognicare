import { useRouter } from "next/navigation";
import { buildChatRoute } from "../utils/chatUtils";
import { ChatNavigationParams } from "../types/chatTypes";

/**
 * Hook to handle navigation to chat threads or direct messages.
 */
export const useChatNavigation = () => {
    const router = useRouter();

    const navigateToChat = (params: ChatNavigationParams) => {
        const route = buildChatRoute(params);
        router.push(route);
    };

    return { navigateToChat };
};
