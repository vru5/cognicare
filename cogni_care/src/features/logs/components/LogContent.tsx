"use client";

import LogsView from "./LogsView";
import { useAuth } from "@/contexts/AuthContext";
import { useLogs } from "@/contexts/LogsContext";
import { EMPTY_LOGS, LOADING_LOGS } from "@/constants/logPage";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { Socket } from "socket.io-client";

/**
 * Displays the logs content using useLogs for caching and memoization
 * @returns 
 */
export default function LogsContent() {
    const { user, loading: authLoading } = useAuth();
    const { fetchLogs, getCachedLogs, loading: logsLoading, restrictedPatients } = useLogs();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlPatientId = searchParams?.get("patientId") ?? null;
    const focusedLogId = searchParams?.get('logId') ?? undefined;

    const [finalPatientId, setFinalPatientId] = useState<string | null>(null);

    useEffect(() => {
        let socket: Socket | null = null;

        async function loadLogs() {
            if (authLoading) return;
            
            const targetId = urlPatientId || user?.profileId;
            if (!targetId) return;

            setFinalPatientId(targetId);
            
            // Always trigger a fetch on mount to ensure freshness (force=true)
            console.log(`[LogsContent] Revalidating logs for: ${targetId}`);
            fetchLogs(targetId, true);

            // Subscribe to Socket.io for real-time log refresh
            console.log(`[LogsContent] Connecting to socket refresh for: ${targetId}`);
            socket = getSocket(targetId);
            
            socket.on('new_notification', (payload: any) => {
                console.log(`[LogsContent] Socket notification received, refetching logs...`, payload);
                fetchLogs(targetId, true);
            });
        }
        
        loadLogs();

        return () => {
            if (socket) {
                console.log(`[LogsContent] Cleaning up socket refresh listeners`);
                socket.off('new_notification');
            }
        };
    }, [user?.profileId, authLoading, fetchLogs, urlPatientId]);

    // Redirect if access is restricted
    useEffect(() => {
        if (finalPatientId && restrictedPatients.has(finalPatientId)) {
            console.log(`[LogsContent] Access restricted for ${finalPatientId}, redirecting to dashboard...`);
            router.push('/dashboard');
        }
    }, [finalPatientId, restrictedPatients, router]);

    const logs = finalPatientId ? getCachedLogs(finalPatientId) : [];

    if (authLoading || (logsLoading && logs.length === 0)) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-brand-gradient">
                <div className="animate-pulse text-white font-bold">{LOADING_LOGS}</div>
            </div>
        );
    }

    if (!finalPatientId) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground text-lg">{EMPTY_LOGS}</p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen">
            <LogsView initialLogs={logs} patientId={finalPatientId} focusedLogId={focusedLogId} />
        </div>
    );
}