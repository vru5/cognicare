"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LogsProvider } from "@/contexts/LogsContext";
import GlobalErrorBoundary from "./GlobalErrorBoundary";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <GlobalErrorBoundary>
            <AuthProvider>
                <NotificationProvider>
                    <LogsProvider>
                        {children}
                    </LogsProvider>
                </NotificationProvider>
            </AuthProvider>
        </GlobalErrorBoundary>
    );
}

