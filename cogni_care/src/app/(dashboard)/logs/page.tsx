"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getLogs } from "@/features/logs/services/logsService";
import LogsView from "@/features/logs/components/LogsView";

export default function LogsPage() {
    const { user, loading: authLoading } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [patientId, setPatientId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            if (authLoading) return; // Wait for auth to initialize
            try {
                // Read profileId directly from Auth context
                const profileId = user?.profileId;

                if (!profileId) {
                    setLoading(false);
                    return;
                }

                setPatientId(profileId);
                const result = await getLogs(profileId);
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
    }, [user, authLoading]);

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-brand-gradient">
                <div className="animate-pulse text-white font-bold">Loading logs...</div>
            </div>
        );
    }

    if (!patientId) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground text-lg">No patient profile found. Please register first.</p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen">
            <LogsView initialLogs={logs} patientId={patientId} />
        </div>
    );
}
