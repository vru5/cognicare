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
import { InsightsCarousel } from "./InsightsCarousel";

const PILLAR_ICONS: Record<string, LucideIcon> = {
  physical: Activity,
  mood: Smile,
  cognitive: Brain,
  sleep: Moon,
  social: Users,
};

/**
 * Single Pillar Finding Section (SOLID: Single Responsibility)
 */
const PillarFindingCard = ({ finding }: { finding: KeyFinding }) => {
  const pillarColor = getPillarColor(finding.pillar);
  const PillarIcon = PILLAR_ICONS[finding.pillar.toLowerCase()] || Activity;

  return (
    <div className="relative overflow-hidden bg-slate-50/50 rounded-[2rem] p-6 border border-slate-200/60 group select-none min-h-[160px]">
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
    </div>
  );
};

/**
 * Single Critical Risk Alert Section (SOLID: Single Responsibility)
 */
const CriticalRiskCard = ({ risk }: { risk: any }) => {
  return (
    <div className="group relative overflow-hidden bg-rose-50/30 border border-rose-200/40 rounded-[2rem] p-6 flex items-start gap-5 transition-all min-h-[140px]">
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
    </div>
  );
};

export default function AiInsightSection({ insights }: AiInsightSectionProps) {
  const { summary, status, topConcern, keyFindings, criticalRisks } = insights;

  const StatusIcon = status === "improving" ? TrendingUp : status === "worsening" ? TrendingDown : Minus;
  const statusColor = status === "improving" ? "text-emerald-600" : status === "worsening" ? "text-rose-600" : "text-amber-600";
  const statusBg = status === "improving" ? "bg-emerald-50/80" : status === "worsening" ? "bg-rose-50/80" : "bg-amber-50/80";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pt-4"
    >
      {/* 1. Integrated Summary Section */}
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
              <p className="text-sm font-bold text-slate-900 leading-relaxed italic pl-1">
                {topConcern.reason}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Critical Risks Carousel */}
      {criticalRisks.length > 0 && (
        <InsightsCarousel 
          items={criticalRisks}
          keyExtractor={(risk, idx) => `risk-${idx}`}
          accentColor="#f43f5e"
          renderItem={(risk) => <CriticalRiskCard risk={risk} />}
        />
      )}

      {/* 3. Categorized Findings Carousel */}
      <InsightsCarousel 
        items={keyFindings}
        keyExtractor={(finding) => finding.pillar}
        accentColor={(finding) => getPillarColor(finding.pillar)}
        renderItem={(finding) => <PillarFindingCard finding={finding} />}
      />
    </motion.div>
  );
}
