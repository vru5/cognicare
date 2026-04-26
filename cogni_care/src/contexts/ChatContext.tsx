"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "@/constants/auth";
import { getSocket } from "@/lib/socket";

interface ChatContextType {
    totalUnreadCount: number;
    canAccessCareCircle: boolean;
    refreshUnreadCount: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({
    totalUnreadCount: 0,
    canAccessCareCircle: true,
    refreshUnreadCount: async () => {},
});

export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [canAccessCareCircle, setCanAccessCareCircle] = useState(true);

    const refreshUnreadCount = useCallback(async () => {
        if (!user?.profileId) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/chat/total-unread?profileId=${user.profileId}&isCarer=${user.isCarer}`);
            const data = await res.json();
            if (data.success) {
                setTotalUnreadCount(data.total);
                if (typeof data.canAccessCareCircle !== "undefined") {
                    setCanAccessCareCircle(data.canAccessCareCircle);
                }
            }
        } catch (error) {
            console.error("[ChatContext] Failed to fetch total unread count:", error);
        }
    }, [user]);

    useEffect(() => {
        if (!user?.profileId) {
            setTotalUnreadCount(0);
            return;
        }

        // Initial fetch
        refreshUnreadCount();

        // Listen for real-time updates
        const socket = getSocket(user.profileId);
        const handleRefresh = () => {
            console.log(`[ChatContext] Socket event received (${user?.profileId}), refreshing unread and permissions...`);
            refreshUnreadCount();
        };

        socket.on("unread_update", handleRefresh);
        socket.on("permission_updated", handleRefresh);

        return () => {
            socket.off("unread_update", handleRefresh);
            socket.off("permission_updated", handleRefresh);
        };
    }, [user, refreshUnreadCount]);

    return (
        <ChatContext.Provider value={{ totalUnreadCount, canAccessCareCircle, refreshUnreadCount }}>
            {children}
        </ChatContext.Provider>
    );
}
