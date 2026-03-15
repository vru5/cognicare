"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LogsProvider } from "@/contexts/LogsContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <NotificationProvider>
                <LogsProvider>
                    {children}
                </LogsProvider>
            </NotificationProvider>
        </AuthProvider>
    );
}

