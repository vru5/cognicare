/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import LogEntryCard from "@/features/logs/components/LogEntryCard";
import AddLogModal from "@/features/logs/components/AddLogModal";
import { ChevronLeft, ChevronRight, ArrowLeft, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLogs } from "@/contexts/LogsContext";
import { useRouter } from "next/navigation";
import { LogSummaryCard } from "../types/logTypes";
import { ADD_LOG_TEXT, BACK_BUTTON, EMPTY_DAY_LOG_TEXT, SELECTED_DATE_ENTRIES } from "../constants/logPage";

type LogViewType = "day" | "week" | "month";

export default function LogsView({ initialLogs, patientId, focusedLogId }: { initialLogs: LogSummaryCard[], patientId: string, focusedLogId?: string }) {
    const { user } = useAuth();
    const { updateLogInCache, deleteLogFromCache } = useLogs();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<LogViewType>("day");
    const [logs, setLogs] = useState<LogSummaryCard[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const today = useMemo(() => new Date(), []);
    // currentDate controls which month/week we are viewing
    const [currentDate, setCurrentDate] = useState(() => new Date(today));
    // selectedDate is the exact day we are viewing logs for
    const [selectedDate, setSelectedDate] = useState(() => new Date(today));

    // Sync logs state when initialLogs prop changes (e.g. switching patients)
    useEffect(() => {
        setLogs(initialLogs || []);
        setMounted(true);
    }, [initialLogs]);

    // When a focusedLogId is provided (from a notification tap), navigate to that log's date
    useEffect(() => {
        if (!focusedLogId || !logs.length) return;
        const targetLog = logs.find(l => l.id === focusedLogId);
        if (targetLog) {
            const logDate = new Date(targetLog.createdAt);
            setSelectedDate(logDate);
            setCurrentDate(logDate);
        }
    }, [focusedLogId, logs]);

    // Carousel direction: 1 for right (next), -1 for left (prev)
    const [direction, setDirection] = useState(0);

    // Swipe detection
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in pixels)
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            navigateDate(1);
        } else if (isRightSwipe) {
            navigateDate(-1);
        }
    };

    const handleUpdateLog = (updatedLog: LogSummaryCard) => {
        // Update context first
        updateLogInCache(patientId, updatedLog);
        
        // Update local state for immediate feedback
        setLogs(currentLogs =>
            currentLogs.map(log => log.id === updatedLog.id ? updatedLog : log)
        );
    };

    const handleAddLog = (newLog: LogSummaryCard) => {
        setLogs(currentLogs => {
            const exists = currentLogs.some(l => l.id === newLog.id);
            if (exists) {
                return currentLogs.map(l => l.id === newLog.id ? newLog : l);
            }
            return [newLog, ...currentLogs];
        });
    };

    // Helper to check if two dates are the same day
    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // Identify which dates have logs
    const datesWithLogs = useMemo(() => {
        return (logs || []).map(log => new Date(log.createdAt));
    }, [logs]);

    const hasLogOnDate = (date: Date) => {
        return datesWithLogs.some(logDate => isSameDay(logDate, date));
    };

    // Filter logs for the selected date
    const selectedLogs = useMemo(() => {
        return (logs || []).filter(log => isSameDay(new Date(log.createdAt), selectedDate));
    }, [logs, selectedDate]);

    const isFutureDate = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const t = new Date(today);
        t.setHours(0, 0, 0, 0);
        return d > t;
    };

    // Calendar logic
    const navigateDate = (amount: number) => {
        const newDate = new Date(currentDate);
        if (viewMode === "month") {
            newDate.setMonth(newDate.getMonth() + amount);
        } else if (viewMode === "week") {
            newDate.setDate(newDate.getDate() + (amount * 7));
        } else {
            newDate.setDate(newDate.getDate() + amount);
        }

        // Prevent navigating forward to a time period that is entirely in the future
        // For 'day' view, it's easy. For 'week'/'month', we might allow viewing the current period
        if (amount > 0) {
            const startOfNewPeriod = new Date(newDate);
            if (viewMode === "month") {
                startOfNewPeriod.setDate(1);
            } else if (viewMode === "week") {
                const day = startOfNewPeriod.getDay();
                startOfNewPeriod.setDate(startOfNewPeriod.getDate() - (day === 0 ? 6 : day - 1));
            }
            startOfNewPeriod.setHours(0, 0, 0, 0);
            
            const startOfToday = new Date(today);
            startOfToday.setHours(0, 0, 0, 0);

            // If the start of the new period is after today, block it (unless it's the current period)
            if (startOfNewPeriod > startOfToday && viewMode === "day") return;
            // For week/month, we can be more lenient or strict. Let's block if the whole period starts after today.
            if (startOfNewPeriod > startOfToday) return;
        }

        setDirection(amount > 0 ? 1 : -1);
        if (viewMode === "day") {
            setSelectedDate(newDate);
        }
        setCurrentDate(newDate);
    };

    const generateCalendarDays = () => {
        const days = [];
        if (viewMode === "month" || viewMode === "week") {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            let startDate = new Date(year, month, 1);
            let endDate = new Date(year, month + 1, 0);

            if (viewMode === "week") {
                const day = currentDate.getDay();
                // Calculate difference to Monday (1)
                const diff = currentDate.getDate() - (day === 0 ? 6 : day - 1);

                startDate = new Date(currentDate);
                startDate.setDate(diff);

                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
            } else {
                // Pad the beginning of the month with empty spaces
                const firstDayIndex = startDate.getDay();
                for (let i = 0; i < (firstDayIndex === 0 ? 6 : firstDayIndex - 1); i++) {
                    days.push(null);
                }
            }

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                days.push(new Date(d));
            }
        }
        return days;
    };

    const calendarDays = generateCalendarDays();
    const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    };

    return (
        <div className="w-full max-w-xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col gap-6 text-foreground">
            {user?.isCarer && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="self-start -mb-2 flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto"
                    onClick={() => router.push('/dashboard')}
                >
                    <ArrowLeft className="w-4 h-4" />
                    {BACK_BUTTON}
                </Button>
            )}
            {/* Top Navigation */}
            <div className="flex justify-between items-center pb-2">
                <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)}>
                    <ChevronLeft className="w-6 h-6 text-muted-foreground" />
                </Button>

                {/* Custom Toggle matching the image */}
                <div className="flex bg-muted rounded-full p-1 shadow-inner relative">
                    {(["day", "week", "month"] as LogViewType[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => {
                                setViewMode(mode);
                                setCurrentDate(selectedDate); // Sync view calendar to the currently active day
                            }}
                            className={`px-5 py-2 text-sm font-bold capitalize rounded-full transition-all z-10 ${viewMode === mode ? "bg-card shadow-sm text-card-foreground" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                <Button variant="ghost" size="icon" onClick={() => navigateDate(1)}>
                    <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </Button>
            </div>

            {/* Calendar Header Date */}
            <div className="text-center py-4">
                <h2 className="text-lg font-bold text-foreground">
                    {mounted && (viewMode === "day"
                        ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                        : currentDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
                    )}
                </h2>
            </div>

            {/* Calendar Grid */}
            {viewMode !== "day" && (
                <div
                    className="mb-8 relative"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.div
                            key={currentDate.toISOString() + viewMode}
                            className="w-full"
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                        >
                            {/* Days of week header */}
                            <div className="grid grid-cols-7 text-center mb-4">
                                {daysOfWeek.map((day, i) => (
                                    <div key={i} className="text-xs font-bold text-muted-foreground uppercase opacity-60">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Dates grid */}
                            <div className="grid grid-cols-7 gap-y-6 text-center">
                                {calendarDays.map((date, i) => {
                                    if (!date) return <div key={`empty-${i}`} className="h-10 w-10"></div>;

                                    const isSelected = isSameDay(date, selectedDate);
                                    const hasLog = hasLogOnDate(date);
                                    const isToday = isSameDay(date, today);
                                    const isFuture = isFutureDate(date);

                                    return (
                                        <div key={date.toISOString()} className="flex justify-center items-center relative">
                                            <button
                                                onClick={() => !isFuture && setSelectedDate(date)}
                                                disabled={isFuture}
                                                className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all
                                                    ${isSelected
                                                        ? "bg-sky-600 text-white shadow-md shadow-sky-200"
                                                        : hasLog
                                                            ? "bg-sky-400 text-white"
                                                            : isFuture 
                                                                ? "text-muted-foreground/30 cursor-not-allowed"
                                                                : "text-foreground hover:bg-sky-50"
                                                    }
                                                    ${!isSelected && !hasLog && isToday ? "border-2 border-dashed border-sky-400 text-sky-600" : ""}
                                                `}
                                            >
                                                {date.getDate()}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

            {/* Logs List for Selected Date */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <h3 className="text-foreground font-black uppercase tracking-widest text-sm flex items-center gap-2">
                        {SELECTED_DATE_ENTRIES} {mounted && selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        <span className="text-[10px] font-black bg-muted px-2 py-1 rounded-full text-muted-foreground">
                            {selectedLogs.length}
                        </span>
                    </h3>
                    {user?.isCarer && !isFutureDate(selectedDate) && (
                        <Button
                            size="sm"
                            onClick={() => setIsAddModalOpen(true)}
                            className="rounded-full bg-primary text-white shadow-md shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-transform px-4"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-wider">{ADD_LOG_TEXT}</span>
                        </Button>
                    )}
                </div>

                <div className="space-y-4 pt-2">
                    {selectedLogs.length > 0 ? (
                        selectedLogs.map((log: LogSummaryCard) => (
                            <LogEntryCard
                                key={log.id}
                                log={log}
                                patientId={patientId}
                                onUpdate={handleUpdateLog}
                                onDelete={(id) => {
                                    deleteLogFromCache(patientId, id);
                                    setLogs(prev => prev.filter(l => l.id !== id));
                                }}
                                highlighted={log.id === focusedLogId}
                            />
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-16 flex flex-col items-center bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-muted">
                            <span className="text-4xl mb-4 grayscale opacity-30">✍️</span>
                            <p className="font-bold uppercase tracking-widest text-xs opacity-60 px-8 text-center leading-loose">
                                {EMPTY_DAY_LOG_TEXT}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {user?.isCarer && (
                <AddLogModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    patientId={patientId}
                    onSuccess={handleAddLog}
                />
            )}
        </div>
    );
}

