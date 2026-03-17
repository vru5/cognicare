"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, FileText, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createManualLog } from "../services/logsService";
import { useAuth } from "@/contexts/AuthContext";
import { useLogs } from "@/contexts/LogsContext";
import { supabase } from "@/lib/supabase";
import { LogSumaryCard } from "../types/logSummaryCard";
import { ADD_LOG, CARER_ENTRY_TEXT, SAVE_LOG_TEXT } from "@/constants/logPage";

interface AddLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    onSuccess: (log: LogSumaryCard) => void;
}

export default function AddLogModal({ isOpen, onClose, patientId, onSuccess }: AddLogModalProps) {
    const { user } = useAuth();
    const { addLogToCache } = useLogs();
    const isCarer = user?.role === "CARER";

    const [text, setText] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (isSaving || !text.trim()) return;

        setIsSaving(true);
        try {
            const result = await createManualLog(patientId, text, isCarer, user?.profileId || undefined);
            if (result.success) {
                // Update local context cache immediately
                addLogToCache(patientId, result.log);

                onSuccess(result.log);
                setText("");
                onClose();
            } else {
                alert(result.error || "Failed to create log");
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-primary p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6" />
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-widest">{ADD_LOG}</h3>
                                    {isCarer && (
                                        <div className="flex items-center gap-1.5 opacity-80 text-[10px] font-bold uppercase tracking-widest">
                                            <BadgeCheck className="w-3 h-3" />
                                            {CARER_ENTRY_TEXT}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    {isCarer ? "Observation or Visit Note" : "How are you feeling?"}
                                </label>
                                <Textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder={isCarer ? "Type your notes about the patient's condition, activities, or mood..." : "Type your log here..."}
                                    className="w-full min-h-[160px] text-lg rounded-2xl border-stone-200 focus:border-primary transition-all resize-none shadow-inner bg-slate-50/50"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-full h-14 font-black uppercase tracking-widest text-xs border-stone-200"
                                    onClick={onClose}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-[2] rounded-full h-14 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                                    onClick={handleSubmit}
                                    disabled={isSaving || !text.trim()}
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-2" />
                                            {SAVE_LOG_TEXT}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
