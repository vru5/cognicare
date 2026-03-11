import LogsView from "./LogsView";
import { useAuth } from "@/contexts/AuthContext";
import { getLogs } from "@/features/logs/services/logsService";
import { useSearchParams } from "next/navigation";
import { LogSumaryCard } from "@/features/logs/types/logSummaryCard";
import { EMPTY_LOGS, LOADING_LOGS } from "@/constants/logPage";
import { useEffect, useState } from "react";

/**
 * Displays the logs content
 * @returns 
 */
export default function LogsContent() {
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const urlPatientId = searchParams.get("patientId");

    const [logs, setLogs] = useState<LogSumaryCard[]>([]);
    const [finalPatientId, setFinalPatientId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        async function fetchLogs() {
            if (authLoading) return;
            try {
                // Priority: 
                // 1. patientId from URL (for carers)
                // 2. profileId from user context (for patients)
                const targetId = urlPatientId || user?.profileId;

                if (!targetId) {
                    setLoading(false);
                    return;
                }

                setFinalPatientId(targetId);
                const result = await getLogs(targetId);
                if (result.success) {
                    setLogs(result.logs || []);
                }
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
        return () => controller.abort();
    }, [user, authLoading, urlPatientId]);

    if (loading) {
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
            <LogsView initialLogs={logs} patientId={finalPatientId} />
        </div>
    );
}