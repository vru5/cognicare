"use client";

import { AiInsightSummary, AiInsightSectionProps } from "../types/insightsTypes";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  ArrowRight,
  Brain,
  Activity,
  Moon,
  Users,
  Smile,
  Heart,
  LucideIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PILLAR_COLORS, getPillarColor } from "../constants/insightsConstants";

const PILLAR_ICONS: Record<string, LucideIcon> = {
  physical: Activity,
  mood: Smile,
  cognitive: Brain,
  sleep: Moon,
  social: Users,
};

export default function AiInsightSection({ insights, accentColor }: AiInsightSectionProps) {
  const { summary, status, topConcern, keyFindings, criticalRisks } = insights;

  const StatusIcon = status === "improving" ? TrendingUp : status === "worsening" ? TrendingDown : Minus;
  const statusColor = status === "improving" ? "text-emerald-600" : status === "worsening" ? "text-rose-600" : "text-amber-600";
  const statusBg = status === "improving" ? "bg-emerald-50" : status === "worsening" ? "bg-rose-50" : "bg-amber-50";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 animate-in fade-in duration-700"
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

        {/* Top Concern Highlight */}
        {topConcern && (
          <div className="mt-6 p-4 bg-white/60 rounded-2xl border border-sky-100 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Concern</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
            <div className="flex items-start gap-3">
              <div 
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center transition-colors"
                style={{ color: getPillarColor(topConcern.pillar) }}
              >
                {topConcern.pillar && PILLAR_ICONS[topConcern.pillar.toLowerCase()] ? (
                    (() => {
                        const Icon = PILLAR_ICONS[topConcern.pillar.toLowerCase()];
                        return <Icon className="w-4 h-4" />;
                    })()
                ) : (
                    <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <p className="text-sm font-bold text-slate-700 leading-snug flex-1">
                <span 
                  className="uppercase text-[11px] font-black mr-2 tracking-tight transition-colors"
                  style={{ color: getPillarColor(topConcern.pillar) }}
                >
                    {topConcern.pillar}:
                </span>
                {topConcern.reason}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Critical Risks (High Visibility) */}
      {criticalRisks.length > 0 && (
        <div className="space-y-3">
          {criticalRisks.map((risk, idx) => (
            <motion.div 
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative overflow-hidden bg-rose-50 border border-rose-200/50 rounded-2xl p-4 shadow-lg shadow-rose-500/5 flex items-start gap-4 transition-all hover:bg-rose-100/50"
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center relative z-10">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1 relative z-10">
                <h4 className="text-[11px] font-black text-rose-900 uppercase tracking-widest mb-1">{risk.type} Alert</h4>
                <p className="text-sm font-bold text-rose-800 leading-relaxed">{risk.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 3. Detailed Findings (Categorized by Pillar) */}
      <div className="grid grid-cols-1 gap-5">
        {keyFindings.map((finding, idx) => {
          const pillarColor = getPillarColor(finding.pillar);
          const PillarIcon = PILLAR_ICONS[finding.pillar.toLowerCase()] || Activity;
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="relative overflow-hidden bg-white rounded-3xl p-5 shadow-sm border border-slate-100 group hover:shadow-md transition-all"
            >
              {/* Subtle Pillar accent on the left */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1.5 opacity-80"
                style={{ backgroundColor: pillarColor }}
              />

              <div className="flex items-start gap-4">
                {/* Icon with Pillar Background */}
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-105"
                  style={{ 
                    backgroundColor: `${pillarColor}10`,
                    color: pillarColor
                  }}
                >
                  <PillarIcon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col mb-2">
                    <span 
                      className="text-[10px] font-black uppercase tracking-[0.15em]"
                      style={{ color: pillarColor }}
                    >
                      {finding.pillar}
                    </span>
                    <h4 className="text-sm font-black text-slate-800 tracking-tight leading-tight">
                      {finding.subCategory}
                    </h4>
                  </div>
                  
                  <p className="text-[13px] font-bold text-slate-500 leading-relaxed">
                    {finding.finding}
                  </p>
                </div>
              </div>

              {/* Decorative background element */}
              <div 
                className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
                style={{ color: pillarColor }}
              >
                 <PillarIcon className="w-24 h-24 rotate-12" />
              </div>
            </motion.div>
          );
        })}
      </div>

    </motion.div>
  );
}
