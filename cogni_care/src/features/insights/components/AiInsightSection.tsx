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
 * Single Pillar Finding Section (flattened)
 */
const PillarFindingCard = ({ finding }: { finding: KeyFinding }) => {
  const pillarColor = getPillarColor(finding.pillar);
  const PillarIcon = PILLAR_ICONS[finding.pillar.toLowerCase()] || Activity;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="relative overflow-hidden bg-slate-50/50 rounded-[2rem] p-6 border border-slate-200/60 group select-none min-h-[160px]"
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5 opacity-60"
        style={{ backgroundColor: pillarColor }}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: `${pillarColor}10`, color: pillarColor, border: `1px solid ${pillarColor}20` }}
          >
            <PillarIcon className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span 
              className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1"
              style={{ color: pillarColor }}
            >
              {finding.pillar}
            </span>
            <h4 className="text-base font-black text-slate-800 tracking-tight leading-none">
              {finding.subCategory}
            </h4>
          </div>
        </div>
        
        <p className="text-[14px] font-bold text-slate-600 leading-relaxed italic pl-1">
          {finding.finding}
        </p>
      </div>

      <div 
        className="absolute -right-4 -bottom-4 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity"
        style={{ color: pillarColor }}
      >
         <PillarIcon className="w-28 h-28 rotate-12" />
      </div>
    </motion.div>
  );
};

/**
 * Single Critical Risk Alert Section (flattened)
 */
const CriticalRiskCard = ({ risk }: { risk: any }) => {
  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ x: 20, opacity: 0 }}
      className="group relative overflow-hidden bg-rose-50/30 border border-rose-200/40 rounded-[2rem] p-6 flex items-start gap-5 transition-all min-h-[140px]"
    >
      <div className="flex flex-col gap-4 relative z-10 w-full">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/80 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <h4 className="text-[11px] font-black text-rose-900 uppercase tracking-widest leading-none">{risk.type} Alert</h4>
        </div>
        <p className="text-[14px] font-bold text-rose-800 leading-relaxed italic pl-1">{risk.message}</p>
      </div>
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
    </motion.div>
  );
};

export default function AiInsightSection({ insights }: AiInsightSectionProps) {
  const { summary, status, topConcern, keyFindings, criticalRisks } = insights;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRiskIndex, setCurrentRiskIndex] = useState(0);

  const StatusIcon = status === "improving" ? TrendingUp : status === "worsening" ? TrendingDown : Minus;
  const statusColor = status === "improving" ? "text-emerald-600" : status === "worsening" ? "text-rose-600" : "text-amber-600";
  const statusBg = status === "improving" ? "bg-emerald-50/80" : status === "worsening" ? "bg-rose-50/80" : "bg-amber-50/80";

  const paginate = useCallback((direction: number) => {
    setCurrentIndex((prev) => (prev + direction + keyFindings.length) % keyFindings.length);
  }, [keyFindings.length]);

  const paginateRisks = useCallback((direction: number) => {
    setCurrentRiskIndex((prev) => (prev + direction + criticalRisks.length) % criticalRisks.length);
  }, [criticalRisks.length]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pt-4"
    >
      {/* 1. Integrated Summary Section (Flattened) */}
      <div className="relative px-2 group">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-primary/90 uppercase tracking-[0.2em]">Summary</span>
          </div>
          
          <div className={cn("px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/50 shadow-sm", statusBg)}>
            <StatusIcon className={cn("w-3 h-3", statusColor)} />
            <span className={cn("text-[9px] font-black uppercase tracking-tighter", statusColor)}>
              {status}
            </span>
          </div>
        </div>

        <p className="text-slate-800 font-bold leading-relaxed relative z-10 text-[15px] italic">
          "{summary}"
        </p>

        {topConcern && (
          <div className="mt-8 pt-6 border-t border-slate-200/40 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-primary/90 uppercase tracking-[0.2em]">Primary Concern</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0" style={{ color: getPillarColor(topConcern.pillar) }}>
                  {(() => {
                    const Icon = PILLAR_ICONS[topConcern.pillar.toLowerCase()] || AlertTriangle;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <span className="uppercase text-[11px] font-black tracking-widest leading-none" style={{ color: getPillarColor(topConcern.pillar) }}>
                  {topConcern.pillar}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 leading-relaxed pl-1 italic">
                {topConcern.reason}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Critical Risks Carousel */}
      {criticalRisks.length > 0 && (
        <div className="space-y-4">
          <div className="relative overflow-hidden">
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

      {/* 3. Categorized Findings Carousel */}
      <div className="space-y-4">
        <div className="relative overflow-hidden">
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
              className={cn("h-1 rounded-full transition-all duration-500", idx === currentIndex ? "w-8" : "w-1.5 opacity-20")}
              style={{ backgroundColor: getPillarColor(finding.pillar) }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
