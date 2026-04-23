"use client";

import { PredictiveAnalysisSectionProps, WatchListEntry } from "../types/insightsTypes";
import { 
  Telescope, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle,
  Lightbulb,
  Activity,
  Smile,
  Brain,
  Moon,
  Users,
  LucideIcon,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getPillarColor } from "../constants/insightsConstants";
import { InsightsCarousel } from "./InsightsCarousel";
import HelpTooltip from "@/components/shared/HelpTooltip";

const PILLAR_ICONS: Record<string, LucideIcon> = {
  physical: Activity,
  mood: Smile,
  cognitive: Brain,
  sleep: Moon,
  social: Users,
};

/**
 * Watchlist Item Card - SOLID: Single Responsibility
 */
const WatchlistItemCard = ({ entry }: { entry: WatchListEntry }) => {
  const Icon = PILLAR_ICONS[entry.pillar.toLowerCase()] || Activity;
  const color = getPillarColor(entry.pillar);

  return (
    <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-200/60 space-y-4">
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white/50" 
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-base font-black uppercase tracking-tight leading-tight text-slate-900">
          <span style={{ color }}>{entry.pillar}</span>: {entry.issue}
        </span>
      </div>
      
      <div className="space-y-1.5 pl-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Advice</span>
        <p className="text-[14px] font-bold text-slate-600 leading-relaxed italic">
          {entry.advice}
        </p>
      </div>
    </div>
  );
};

export default function PredictiveAnalysisSection({
  analysis,
  accentColor,
}: PredictiveAnalysisSectionProps) {
  const { outlook, predictedTrend, watchList, proactiveSteps } = analysis;

  const trendConfig = {
    improving: { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50/80", label: "Improving Outlook" },
    stable: { icon: Minus, color: "text-amber-600", bg: "bg-amber-50/80", label: "Stable Outlook" },
    risk_of_decline: { icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-50/80", label: "Potential Decline" },
  };

  const currentTrend = trendConfig[predictedTrend as keyof typeof trendConfig] || trendConfig.stable;
  const { icon: TrendIcon, color: trendColor, bg: trendBg, label: trendLabel } = currentTrend;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pt-4"
    >
      {/* 1. Outlook Summary */}
      <div className="relative px-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary/80" />
            <span className="text-[10px] font-black text-primary/90 uppercase tracking-[0.2em]">7-Day Health Forecast</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={cn("px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/50 shadow-sm", trendBg)}>
              <TrendIcon className={cn("w-3 h-3", trendColor)} />
              <span className={cn("text-[9px] font-black uppercase tracking-tighter", trendColor)}>
                {trendLabel}
              </span>
            </div>
          </div>
        </div>

        <p className="text-slate-800 font-bold leading-relaxed relative z-10 text-[15px] italic">
          "{outlook}"
        </p>
      </div>

      <div className="h-px bg-slate-100 mx-2" />

      {/* 2. Watchlist Carousel */}
      {watchList.length > 0 && (
        <>
          <div className="space-y-4 px-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Weekly Watchlist</span>
            </div>
            
            <InsightsCarousel 
              items={watchList}
              keyExtractor={(item) => item.pillar}
              accentColor={(item) => getPillarColor(item.pillar)}
              renderItem={(item) => <WatchlistItemCard entry={item} />}
            />
          </div>
          <div className="h-px bg-slate-100 mx-2" />
        </>
      )}

      {/* 3. Proactive Steps */}
      <div className="space-y-6 px-2">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recommended Actions</span>
        </div>
        
        <div className="space-y-5">
          {proactiveSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                <span className="text-[10px] font-black text-primary">{idx + 1}</span>
              </div>
              <p className="text-[14px] font-bold text-slate-700 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
