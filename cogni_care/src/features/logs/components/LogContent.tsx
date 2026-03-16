"use client";

import LogsView from "./LogsView";
import { useAuth } from "@/contexts/AuthContext";
import { useLogs } from "@/contexts/LogsContext";
import { EMPTY_LOGS, LOADING_LOGS } from "@/constants/logPage";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Displays the logs content using useLogs for caching and memoization
 * @returns 
 */
export default function LogsContent() {
    const { user, loading: authLoading } = useAuth();
    const { fetchLogs, getCachedLogs, loading: logsLoading } = useLogs();
    const searchParams = useSearchParams();
    const urlPatientId = searchParams?.get("patientId") ?? null;
    const focusedLogId = searchParams?.get('logId') ?? undefined;

    const [finalPatientId, setFinalPatientId] = useState<string | null>(null);

    useEffect(() => {
        let channel: RealtimeChannel;

        async function loadLogs() {
            if (authLoading) return;
            
            const targetId = urlPatientId || user?.profileId;
            if (!targetId) return;

            setFinalPatientId(targetId);
            
            // Always trigger a fetch on mount to ensure freshness (force=true)
            console.log(`[LogsContent] Revalidating logs for: ${targetId}`);
            fetchLogs(targetId, true);

            // Subscribe to notifications for real-time log refresh
            console.log(`[LogsContent] Subscribing to refresh triggers for: ${targetId}`);
            channel = supabase.channel(`logs_refresh:${targetId}`)
                .on(
                    'broadcast',
                    { event: 'new_notification' },
                    () => {
                        console.log(`[LogsContent] Notification received, refetching logs...`);
                        fetchLogs(targetId, true);
                    }
                )
                .subscribe();
        }
        
        loadLogs();

        return () => {
            if (channel) {
                console.log(`[LogsContent] Cleaning up logs refresh subscription`);
                supabase.removeChannel(channel);
            }
        };
    }, [user?.profileId, authLoading, fetchLogs, urlPatientId]);

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