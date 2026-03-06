"use client";

import { useEffect, useState } from "react";
import { getLogs } from "@/features/logs/services/logsService";
import LogsView from "@/features/logs/components/LogsView";

export default function LogsPage() {
    const patientId = "cm7pm9uog0000uxps30r9qnh2";
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            try {
                const result = await getLogs(patientId);
                if (result.success) {
                    setLogs(result.logs as any[]);
                }
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, []);

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-brand-gradient">
                <div className="animate-pulse text-white font-bold">Loading logs...</div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen">
            <LogsView initialLogs={logs} patientId={patientId} />
        </div>
    );
}
