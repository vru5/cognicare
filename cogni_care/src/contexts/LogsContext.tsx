"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { LogSumaryCard } from '@/features/logs/types/logSummaryCard';
import { getLogs as fetchLogsApi } from '@/features/logs/services/logsService';
import { useAuth } from '@/contexts/AuthContext';

interface LogsContextType {
    logsByPatient: Record<string, LogSumaryCard[]>;
    loading: boolean;
    error: string | null;
    fetchLogs: (patientId: string, force?: boolean) => Promise<void>;
    getCachedLogs: (patientId: string) => LogSumaryCard[];
    hasFetched: (patientId: string) => boolean;
    clearCache: (patientId?: string) => void;
}

const LogsContext = createContext<LogsContextType | undefined>(undefined);

export function LogsProvider({ children }: { children: React.ReactNode }) {
    const [logsByPatient, setLogsByPatient] = useState<Record<string, LogSumaryCard[]>>({});
    const [fetchedPatients, setFetchedPatients] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();

    const fetchLogs = useCallback(async (patientId: string, force = false) => {
        if (!force && fetchedPatients.has(patientId)) return;

        setLoading(true);
        setError(null);
        try {
            const result = await fetchLogsApi(patientId, user?.profileId || undefined, user?.isCarer);
            if (result.success) {
                setLogsByPatient(prev => ({
                    ...prev,
                    [patientId]: result.logs || []
                }));
                setFetchedPatients(prev => new Set(prev).add(patientId));
            } else {
                setError(result.error || 'Failed to fetch logs');
            }
        } catch (err) {
            setError('An unexpected error occurred while fetching logs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [fetchedPatients]);

    const getCachedLogs = useCallback((patientId: string) => {
        return logsByPatient[patientId] || [];
    }, [logsByPatient]);

    const hasFetched = useCallback((patientId: string) => {
        return fetchedPatients.has(patientId);
    }, [fetchedPatients]);

    const clearCache = useCallback((patientId?: string) => {
        if (patientId) {
            setLogsByPatient(prev => {
                const newState = { ...prev };
                delete newState[patientId];
                return newState;
            });
            setFetchedPatients(prev => {
                const newState = new Set(prev);
                newState.delete(patientId);
                return newState;
            });
        } else {
            setLogsByPatient({});
            setFetchedPatients(new Set());
        }
    }, []);

    const value = useMemo(() => ({
        logsByPatient,
        loading,
        error,
        fetchLogs,
        getCachedLogs,
        hasFetched,
        clearCache
    }), [logsByPatient, loading, error, fetchLogs, getCachedLogs, hasFetched, clearCache]);

    return (
        <LogsContext.Provider value={value}>
            {children}
        </LogsContext.Provider>
    );
}

export function useLogs() {
    const context = useContext(LogsContext);
    if (context === undefined) {
        throw new Error('useLogs must be used within a LogsProvider');
    }
    return context;
}
