"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, FileText, BadgeCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createManualLog } from "../services/logsService";
import { processBrainDump } from "@/features/brain-dump/services/processText";
import SummaryCard from "@/features/brain-dump/components/SummaryCard";
import { useAuth } from "@/contexts/AuthContext";
import { useLogs } from "@/contexts/LogsContext";
import { AddLogModalProps, LogSummaryCard } from "../types/logTypes";
import { ADD_LOG, CARER_ENTRY_TEXT, SAVE_LOG_TEXT } from "../constants/logPage";

type ModalState = "INPUT" | "ANALYZING" | "ANALYSIS_CARD";

export default function AddLogModal({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}: AddLogModalProps) {
  const { user } = useAuth();
  const { addLogToCache, updateLogInCache } = useLogs();
  const isCarer = user?.role === "CARER";

  const [text, setText] = useState("");
  const [modalState, setModalState] = useState<ModalState>("INPUT");
  const [summary, setSummary] = useState<LogSummaryCard | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const handleReset = () => {
    setText("");
    setSummary(null);
    setModalState("INPUT");
    setIsSavingNote(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleManualSave = async () => {
    if (isSavingNote || !text.trim()) return;

    setIsSavingNote(true);
    try {
      const result = await createManualLog(
        patientId,
        text,
        isCarer,
        user?.profileId || undefined,
      );
      if (result.success) {
        addLogToCache(patientId, result.log);
        onSuccess(result.log);
        handleClose();
      } else {
        alert(result.error || "Failed to create log");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setModalState("ANALYZING");
    try {
      const response = await processBrainDump(text, patientId, isCarer, user?.profileId || undefined);
      if (response.success && response.log) {
        setSummary({
          ...response.log,
          message: response.message || "AI Analysis complete. Refine scores if needed.",
        });
        // Add to cache immediately so it's visible in the background/page
        addLogToCache(patientId, response.log);
        setModalState("ANALYSIS_CARD");
      } else {
        alert(response.error || "Analysis failed.");
        setModalState("INPUT");
      }
    } catch (err) {
      alert("Error during analysis flow.");
      setModalState("INPUT");
    }
  };

  const handleSeverityUpdate = (pillar: string, value: number) => {
    if (summary) {
      const updatedSummary = {
        ...summary,
        [`${pillar}Severity`]: value
      };
      setSummary(updatedSummary);
      // Also update cache immediately so background list is in sync
      updateLogInCache(patientId, updatedSummary);
    }
  };

  const handleFinalSave = () => {
    if (summary) {
      updateLogInCache(patientId, summary);
      onSuccess(summary);
    }
    onClose();
    handleReset();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`relative w-full ${modalState === "ANALYSIS_CARD" ? "max-w-4xl" : "max-w-lg"} bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500`}
          >
            {/* Header */}
            <div className="bg-primary p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest">
                    {modalState === "ANALYSIS_CARD" ? "Symptom Analysis" : ADD_LOG}
                  </h3>
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
                onClick={handleClose}
                className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Content */}
            <div className={`${modalState === "ANALYSIS_CARD" ? "p-0" : "p-8"} space-y-6`}>
              {modalState === "INPUT" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      {isCarer ? "Enter Symptoms or Observation" : "How are you feeling?"}
                    </label>
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={
                        isCarer
                          ? "Type symptoms here to analyze..."
                          : "Type your log here..."
                      }
                      className="w-full min-h-[160px] text-lg rounded-xl border-stone-200 focus:border-primary transition-all resize-none shadow-inner bg-slate-50/50"
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-14 font-black uppercase tracking-widest text-xs border-stone-200"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    
                    {isCarer ? (
                      <Button
                        className="flex-[2] rounded-xl h-14 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                        onClick={handleAnalyze}
                        disabled={!text.trim()}
                      >
                        <BadgeCheck className="w-5 h-5 mr-2" />
                        Enter Log (Analyze)
                      </Button>
                    ) : (
                      <Button
                        className="flex-[2] rounded-xl h-14 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                        onClick={handleManualSave}
                        disabled={isSavingNote || !text.trim()}
                      >
                        {isSavingNote ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            {SAVE_LOG_TEXT}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {modalState === "ANALYZING" && (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <div className="relative">
                    <Loader2 className="w-20 h-20 animate-spin text-primary" />
                    <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-black uppercase tracking-widest text-primary animate-pulse">
                      Analyzing Symptoms...
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Our AI is extracting clinical details from your log.
                    </p>
                  </div>
                </div>
              )}

              {modalState === "ANALYSIS_CARD" && summary && (
                <div className="animate-in fade-in zoom-in duration-500 p-8 sm:p-10">
                  <SummaryCard 
                    summary={summary} 
                    handleReset={handleReset} 
                    showSaveButton={true}
                    onSave={handleFinalSave}
                    showClearButton={false}
                    flat={true}
                    onSeverityUpdate={handleSeverityUpdate}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
