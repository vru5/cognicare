"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LogsProvider } from "@/contexts/LogsContext";
import { ChatProvider } from "@/contexts/ChatContext";
import GlobalErrorBoundary from "./GlobalErrorBoundary";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <GlobalErrorBoundary>
            <AuthProvider>
                <NotificationProvider>
                    <ChatProvider>
                        <LogsProvider>
                            {children}
                        </LogsProvider>
                    </ChatProvider>
                </NotificationProvider>
            </AuthProvider>
        </GlobalErrorBoundary>
    );
}
