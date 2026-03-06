/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useVoiceCapture } from "../hooks/useVoiceCapture";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SummaryCard from "./SummaryCard";
import { processBrainDump } from "../services/processText";
import { transcribeAudio } from "../services/google-transcribe";

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
      console.log("Audio captured, starting transcription...");
      setSummary(null);
      setProcessedText("");

      try {
        const base64Data = audioResult.recordDataBase64;
        if (!base64Data) {
          throw new Error("No audio data captured.");
        }

        const transcription = await transcribeAudio(base64Data);

        if (transcription.success) {
          if (!transcription.text) {
            console.warn("No speech detected in audio.");
            alert("No speech detected. Please speak more clearly or check your microphone.");
            return;
          }

          console.log("Transcript received:", transcription.text);
          setProcessedText(transcription.text);

          const response = await processBrainDump(
            transcription.text,
            "cm7pm9uog0000uxps30r9qnh2"
          );

          if (response.success && response.log) {
            const log = response.log;
            setSummary({
              physical: log.physical,
              mood: log.mood,
              cognitive: log.cognitive,
              sleep: log.sleep,
              social: log.social,
              message: response.message || "Analysis complete! Logged to your timeline.",
            });
          } else {
            console.error("API error for voice:", response.error);
            alert("Failed to process transcribed text.");
          }
        } else {
          console.error("Transcription error:", transcription.error);
          alert("Transcription failed: " + (transcription.error || "Unknown error"));
        }
      } catch (err) {
        console.error("Voice pipeline error:", err);
        alert("An error occurred during voice processing.");
      } finally {
        setIsVoiceAnalyzing(false);
      }
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
    setSummary(null);
    setProcessedText("");

    try {
      const response = await processBrainDump(text, "cm7pm9uog0000uxps30r9qnh2");

      if (response.success && response.log) {
        setProcessedText(text);

        const log = response.log;
        const newSummary = {
          physical: log.physical,
          mood: log.mood,
          cognitive: log.cognitive,
          sleep: log.sleep,
          social: log.social,
          message: response.message || "Analysis complete! Logged to your timeline.",
        };
        console.log("Setting Summary in Frontend:", newSummary);
        setSummary(newSummary);
        setText("");
      } else {
        console.error("API error:", response.error);
        alert("Failed to process entry.");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error while processing entry.");
    } finally {
      setIsTextAnalyzing(false);
    }
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
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col gap-8 sm:gap-12 ">
      {/* Summary Card at the Top */}
      <AnimatePresence>
        {summary && processedText && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="w-full"
          >
            <SummaryCard handleReset={handleReset} summary={summary} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col gap-10">
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-3xl font-black tracking-tight sm:text-6xl text-foreground leading-none">
            Mind Dump
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto px-2">
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
                ${isVisuallyRecording ? "shadow-destructive/40" : "bg-card"} 
                ${isVoiceAnalyzing && !isVisuallyRecording ? "bg-muted text-muted-foreground" : ""}`}
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

            <p className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-foreground font-bold uppercase tracking-widest text-sm whitespace-nowrap">
              {isVisuallyRecording ? "Recording..." : "Tap for Voice Dump"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center opacity-60 my-2">
          <div className="h-px bg-border w-1/4" />
          <span className="px-4 text-muted-foreground font-black uppercase tracking-widest text-xs">
            Or type manually
          </span>
          <div className="h-px bg-border w-1/4" />
        </div>

        {/* Input Area for Text Pipeline */}
        <div className="w-full space-y-4 sm:space-y-6 pb-12">
          <div className="rounded-t-[2.5rem] sm:rounded-t-[3rem] bg-card/80 backdrop-blur-md border-t border-border p-6 sm:p-8">
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

          <div className="flex justify-center items-center px-4">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!text || isTextAnalyzing || isVoiceAnalyzing}
              className="px-12 h-16 rounded-full text-lg font-black shadow-[0_10px_30px_rgba(var(--primary),0.3)] bg-primary text-foreground hover:translate-y-[-2px] active:translate-y-0 transition-all"
            >
              Process Written Entry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
