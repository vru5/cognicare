"use client";

import { useState, useCallback } from "react";
import { AiInsightSectionProps, KeyFinding } from "../types/insightsTypes";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  Brain,
  Activity,
  Moon,
  Users,
  Smile,
  LucideIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getPillarColor } from "../constants/insightsConstants";

const PILLAR_ICONS: Record<string, LucideIcon> = {
  physical: Activity,
  mood: Smile,
  cognitive: Brain,
  sleep: Moon,
  social: Users,
};

/**
 * Single Pillar Finding Card (extracted for SOLID/DRY)
 */
const PillarFindingCard = ({ finding }: { finding: KeyFinding }) => {
  const pillarColor = getPillarColor(finding.pillar);
  const PillarIcon = PILLAR_ICONS[finding.pillar.toLowerCase()] || Activity;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-slate-100 group select-none min-h-[160px]"
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5 opacity-80"
        style={{ backgroundColor: pillarColor }}
      />

      <div className="flex items-start gap-5">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0"
          style={{ backgroundColor: `${pillarColor}10`, color: pillarColor }}
        >
          <PillarIcon className="w-7 h-7" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col mb-3">
            <span 
              className="text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ color: pillarColor }}
            >
              {finding.pillar}
            </span>
            <h4 className="text-base font-black text-slate-800 tracking-tight leading-tight">
              {finding.subCategory}
            </h4>
          </div>
          
          <p className="text-[14px] font-bold text-slate-500 leading-relaxed italic">
            {finding.finding}
          </p>
        </div>
      </div>

      <div 
        className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity"
        style={{ color: pillarColor }}
      >
         <PillarIcon className="w-28 h-28 rotate-12" />
      </div>
    </motion.div>
  );
};

/**
 * Single Critical Risk Alert Card (extracted for SOLID/DRY)
 */
const CriticalRiskCard = ({ risk }: { risk: any }) => {
  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ x: 20, opacity: 0 }}
      className="group relative overflow-hidden bg-rose-50 border border-rose-200/50 rounded-3xl p-6 shadow-lg shadow-rose-500/5 flex items-start gap-5 transition-all min-h-[140px]"
    >
      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center relative z-10 shrink-0">
        <AlertTriangle className="w-6 h-6 text-rose-600" />
      </div>
      <div className="flex-1 relative z-10 min-w-0">
        <h4 className="text-[11px] font-black text-rose-900 uppercase tracking-widest mb-1.5">{risk.type} Alert</h4>
        <p className="text-[14px] font-bold text-rose-800 leading-relaxed italic">{risk.message}</p>
      </div>
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
    </motion.div>
  );
};

export default function AiInsightSection({ insights }: AiInsightSectionProps) {
  const { summary, status, topConcern, keyFindings, criticalRisks } = insights;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRiskIndex, setCurrentRiskIndex] = useState(0);

  const StatusIcon = status === "improving" ? TrendingUp : status === "worsening" ? TrendingDown : Minus;
  const statusColor = status === "improving" ? "text-emerald-600" : status === "worsening" ? "text-rose-600" : "text-amber-600";
  const statusBg = status === "improving" ? "bg-emerald-50" : status === "worsening" ? "bg-rose-50" : "bg-amber-50";

  const paginate = useCallback((direction: number) => {
    setCurrentIndex((prev) => (prev + direction + keyFindings.length) % keyFindings.length);
  }, [keyFindings.length]);

  const paginateRisks = useCallback((direction: number) => {
    setCurrentRiskIndex((prev) => (prev + direction + criticalRisks.length) % criticalRisks.length);
  }, [criticalRisks.length]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 1. Header with Status */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">AI Clinical Insights</h3>
        </div>
        <div className={cn("px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors", statusBg)}>
          <StatusIcon className={cn("w-3 h-3", statusColor)} />
          <span className={cn("text-[10px] font-black uppercase tracking-tighter", statusColor)}>
            {status}
          </span>
        </div>
      </div>

      {/* 2. Main Summary Card */}
      <div className="bg-sky-50 border border-sky-100/50 rounded-3xl p-6 shadow-xl shadow-sky-900/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
          <Sparkles className="w-24 h-24 text-primary" />
        </div>
        <p className="text-slate-600 font-bold leading-relaxed relative z-10 text-sm italic">
          "{summary}"
        </p>

        {topConcern && (
          <div className="mt-6 p-4 bg-white/60 rounded-2xl border border-sky-100 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Concern</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center" style={{ color: getPillarColor(topConcern.pillar) }}>
                {(() => {
                  const Icon = PILLAR_ICONS[topConcern.pillar.toLowerCase()] || AlertTriangle;
                  return <Icon className="w-4 h-4" />;
                })()}
              </div>
              <p className="text-sm font-bold text-slate-700 leading-snug flex-1">
                <span className="uppercase text-[11px] font-black mr-2 tracking-tight" style={{ color: getPillarColor(topConcern.pillar) }}>
                  {topConcern.pillar}:
                </span>
                {topConcern.reason}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Critical Risks Carousel */}
      {criticalRisks.length > 0 && (
        <div className="space-y-4">
          <div className="relative overflow-hidden px-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRiskIndex}
                drag={criticalRisks.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -100) paginateRisks(1);
                  if (info.offset.x > 100) paginateRisks(-1);
                }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={cn(criticalRisks.length > 1 ? "cursor-grab active:cursor-grabbing" : "")}
              >
                {criticalRisks[currentRiskIndex] && <CriticalRiskCard risk={criticalRisks[currentRiskIndex]} />}
              </motion.div>
            </AnimatePresence>
          </div>
          {criticalRisks.length > 1 && (
            <div className="flex justify-center items-center gap-1.5 pt-1">
              {criticalRisks.map((_, idx) => (
                <div key={idx} className={cn("h-1 rounded-full transition-all duration-300", idx === currentRiskIndex ? "w-6 bg-rose-500" : "w-1.5 bg-rose-200")} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Categorized Findings Carousel */}
      <div className="space-y-4">
        <div className="relative overflow-hidden px-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -100) paginate(1);
                if (info.offset.x > 100) paginate(-1);
              }}
              initial={{ opacity: 0, x: 50, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="cursor-grab active:cursor-grabbing"
            >
              {keyFindings[currentIndex] && <PillarFindingCard finding={keyFindings[currentIndex]} />}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center items-center gap-2 py-2">
          {keyFindings.map((finding, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn("h-1.5 rounded-full transition-all duration-500", idx === currentIndex ? "w-8" : "w-2 opacity-30")}
              style={{ backgroundColor: getPillarColor(finding.pillar) }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
