"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { LogSumaryCard } from '@/features/logs/types/logSummaryCard';
import { getLogs as fetchLogsApi } from '@/features/logs/services/logsService';
import { useAuth } from '@/contexts/AuthContext';
import { getSocket } from '@/lib/socket';

interface LogsContextType {
    logsByPatient: Record<string, LogSumaryCard[]>;
    loading: boolean;
    error: string | null;
    fetchLogs: (patientId: string, force?: boolean) => Promise<void>;
    getCachedLogs: (patientId: string) => LogSumaryCard[];
    hasFetched: (patientId: string) => boolean;
    clearCache: (patientId?: string) => void;
    addLogToCache: (patientId: string, log: LogSumaryCard) => void;
    updateLogInCache: (patientId: string, log: LogSumaryCard) => void;
    deleteLogFromCache: (patientId: string, logId: string) => void;
    restrictedPatients: Set<string>;
}

const LogsContext = createContext<LogsContextType | undefined>(undefined);

export function LogsProvider({ children }: { children: React.ReactNode }) {
    const [logsByPatient, setLogsByPatient] = useState<Record<string, LogSumaryCard[]>>({});
    const [fetchedPatients, setFetchedPatients] = useState<Set<string>>(new Set());
    const [restrictedPatients, setRestrictedPatients] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();

    const fetchLogs = useCallback(async (patientId: string, force = false) => {
        // Use a functional update or a ref if needed, but here we can just check the current state 
        // since fetchLogs is usually called in useEffect or event handlers.
        // To avoid the infinite loop, we must ensure fetchLogs doesn't change when fetchedPatients changes.
        // However, if we need to check fetchedPatients, we can use a functional check or just let it be.
        // The real issue is LogsContent calling it in a way that triggers a re-render which triggers fetchLogs.
        
        setLoading(true);
        setError(null);
        try {
            const result = await fetchLogsApi(patientId, user?.profileId || undefined, user?.isCarer);
            if (result.success) {
                if (result.restricted) {
                    setRestrictedPatients(prev => new Set(prev).add(patientId));
                    setLogsByPatient(prev => ({ ...prev, [patientId]: [] }));
                } else {
                    setLogsByPatient(prev => ({
                        ...prev,
                        [patientId]: result.logs || []
                    }));
                    setRestrictedPatients(prev => {
                        const next = new Set(prev);
                        next.delete(patientId);
                        return next;
                    });
                }
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
    }, [user?.profileId, user?.isCarer]); // Removed fetchedPatients from dependencies

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
    
    const addLogToCache = useCallback((patientId: string, log: LogSumaryCard) => {
        setLogsByPatient(prev => ({
            ...prev,
            [patientId]: [log, ...(prev[patientId] || [])]
        }));
    }, []);

    const updateLogInCache = useCallback((patientId: string, log: LogSumaryCard) => {
        setLogsByPatient(prev => ({
            ...prev,
            [patientId]: (prev[patientId] || []).map(l => l.id === log.id ? log : l)
        }));
    }, []);

    const deleteLogFromCache = useCallback((patientId: string, logId: string) => {
        setLogsByPatient(prev => ({
            ...prev,
            [patientId]: (prev[patientId] || []).filter(l => l.id !== logId)
        }));
    }, []);

    useEffect(() => {
        if (!user?.profileId) return;

        console.log(`[LogsContext] Connecting to socket and joining room ${user.profileId}`);
        const socket = getSocket(user.profileId);

        socket.on('permission_updated', (payload: any) => {
            console.log('[LogsContext] Socket permission_updated received:', payload);
            const { patientId, accessSymptomLogs } = payload;
            
            if (accessSymptomLogs === false) {
                setRestrictedPatients(prev => new Set([...prev, patientId]));
                setLogsByPatient(prev => ({ ...prev, [patientId]: [] }));
            } else if (accessSymptomLogs === true) {
                setRestrictedPatients(prev => {
                    const next = new Set(prev);
                    next.delete(patientId);
                    return next;
                });
                // Optionally refetch logs here if they were previously restricted
                fetchLogs(patientId, true);
            }
        });

        return () => {
            socket.off('permission_updated');
        };
    }, [user?.profileId, fetchLogs]);

    const value = useMemo(() => ({
        logsByPatient,
        loading,
        error,
        fetchLogs,
        getCachedLogs,
        hasFetched,
        clearCache,
        addLogToCache,
        updateLogInCache,
        deleteLogFromCache,
        restrictedPatients
    }), [logsByPatient, loading, error, fetchLogs, getCachedLogs, hasFetched, clearCache, addLogToCache, updateLogInCache, deleteLogFromCache, restrictedPatients]);

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
