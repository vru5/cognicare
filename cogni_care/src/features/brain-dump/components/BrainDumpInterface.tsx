/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useVoiceCapture } from "../hooks/useVoiceCapture";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SummaryCard from "./SummaryCard";

export default function BrainDumpInterface() {
  const [text, setText] = useState("");
  const [processedText, setProcessedText] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [isFocused, setIsFocused] = useState(false);

  const [isVoiceAnalyzing, setIsVoiceAnalyzing] = useState(false);
  const [isTextAnalyzing, setIsTextAnalyzing] = useState(false);

  const {
    isRecording: hookIsRecording,
    startRecording,
    stopRecording,
  } = useVoiceCapture();
  const [isVisuallyRecording, setIsVisuallyRecording] = useState(false);

  const handleVoiceToggle = async () => {
    if (hookIsRecording || isVisuallyRecording) {
      setIsVisuallyRecording(false);
      setIsVoiceAnalyzing(true);

      const audioResult = await stopRecording();
      console.log("Audio captured:", audioResult);

      // 1. Voice Pipeline: Simulate Whisper Transcription -> Automated Summary
      setTimeout(() => {
        const transcribedText =
          "I've been feeling quite a bit of pressure in my head today ...";

        // Automated flow for Voice Pipeline: Trigger analysis summary
        setTimeout(() => {
          setIsVoiceAnalyzing(false);
          setProcessedText(transcribedText);
          setSummary({
            physical: "Headache detected",
            cognitive: "Confusion noted",
            message:
              "Based on your voice entry, we've noticed impacts on your physical and Mood pillars.",
          });
        }, 1500);
      }, 1000);
    } else {
      // Start recording path
      setIsVisuallyRecording(true);
      try {
        await startRecording();
      } catch (err) {
        console.error("Failed to start recording:", err);
        setIsVisuallyRecording(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!text) return;
    setIsTextAnalyzing(true);
    // Simulate NLP Analysis
    setTimeout(() => {
      setIsTextAnalyzing(false);
      setProcessedText(text);
      setSummary({
        physical: "Headache detected",
        cognitive: "Confusion noted",
        message:
          "Based on your written entry, we've noticed impacts on your physical and Mood pillars.",
      });
      setText(""); // Optionally clear the textarea after processing
    }, 2000);
  };

  const handleReset = () => {
    setText("");
    setProcessedText("");
    setSummary(null);
    setIsFocused(false);
    setIsVisuallyRecording(false);
    setIsVoiceAnalyzing(false);
    setIsTextAnalyzing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 min-h-screen flex flex-col gap-12 ">
      {/* Summary Card at the Top */}
      <AnimatePresence>
        {summary && processedText && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="w-full"
          >
            <SummaryCard handleReset={handleReset} summary={summary}/>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col gap-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl text-slate-900 leading-none">
            Mind Dump
          </h1>
          <p className="text-slate-500 text-xl max-w-xl mx-auto">
            Speak or type your raw thoughts. Let us organize the insights.
          </p>
        </div>

        {/* Central Prominent Mic Area for Voice Pipeline */}
        <div className="flex flex-col items-center justify-center pt-4 pb-8">
          <div className="relative group">
            <AnimatePresence>
              {isVisuallyRecording && (
                <>
                  <motion.div
                    key="ring-pulse-inner"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeOut",
                    }}
                    className="absolute inset-0 rounded-full border-[3px] border-destructive/30"
                  />
                  <motion.div
                    key="ring-pulse-outer"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 3, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeOut",
                      delay: 0.4,
                    }}
                    className="absolute inset-0 rounded-full border-[3px] border-destructive/20"
                  />
                </>
              )}
            </AnimatePresence>

            <Button
              variant={isVisuallyRecording ? "destructive" : "secondary"}
              size="lg"
              disabled={
                isTextAnalyzing || (isVoiceAnalyzing && !isVisuallyRecording)
              }
              className={`rounded-full w-48 h-48 sm:w-56 sm:h-56 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:scale-105 active:scale-95 z-10 relative 
                ${isVisuallyRecording ? "shadow-destructive/40" : "bg-white"} 
                ${isVoiceAnalyzing && !isVisuallyRecording ? "bg-slate-100 text-slate-400" : ""}`}
              onClick={handleVoiceToggle}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <Mic
                  className={`text-primary h-16 w-16 sm:h-20 sm:w-20 ${isVisuallyRecording ? "animate-pulse" : " "}`}
                />
                {isVoiceAnalyzing && !isVisuallyRecording && (
                  <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing
                  </span>
                )}
              </div>
            </Button>

            <p className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-slate-400 font-bold uppercase tracking-widest text-sm whitespace-nowrap">
              {isVisuallyRecording ? "Recording..." : "Tap for Voice Dump"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center opacity-60 my-2">
          <div className="h-px bg-slate-300 w-1/4" />
          <span className="px-4 text-slate-400 font-black uppercase tracking-widest text-xs">
            Or type manually
          </span>
          <div className="h-px bg-slate-300 w-1/4" />
        </div>

        {/* Input Area for Text Pipeline */}
        <div className="w-full space-y-6 pb-12">
          <div className="rounded-t-[3rem] bg-card/80 backdrop-blur-md border-t border-border p-8">
            <Textarea
              placeholder="How are you feeling today? e.g., 'Feeling a bit dizzy'..."
              value={text}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground"
            />
            {isTextAnalyzing && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[2rem] flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
                  </div>
                  <p className="text-primary font-black uppercase tracking-widest">
                    Processing entry...
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end items-center px-4">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!text || isTextAnalyzing || isVoiceAnalyzing}
              className="px-12 h-16 rounded-full text-lg font-black shadow-[0_10px_30px_rgba(var(--primary),0.3)] bg-primary text-white hover:translate-y-[-2px] active:translate-y-0 transition-all"
            >
              Process Written Entry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
