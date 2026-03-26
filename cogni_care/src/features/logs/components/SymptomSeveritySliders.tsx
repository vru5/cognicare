import { Slider } from "@/components/ui/slider";
import { SymptomPillar } from "../types/logTypes";
import { PILLAR_CONFIG } from "../constants/pillarConfig";
import { LucideIcon } from "lucide-react";

interface SymptomSeveritySlidersProps {
  severities: Record<string, number | null>;
  onSeverityChange: (pillar: SymptomPillar, value: number) => void;
  onSeverityCommit?: (pillar: SymptomPillar, value: number) => void;
  activePillars: SymptomPillar[];
  labels?: Record<string, string | null | undefined>;
}

export default function SymptomSeveritySliders({
  severities,
  onSeverityChange,
  onSeverityCommit,
  activePillars,
  labels,
}: SymptomSeveritySlidersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
      {activePillars.map((pillarKey) => {
        const config = PILLAR_CONFIG[pillarKey];
        if (!config) return null;
        const Icon = config.icon as LucideIcon;
        const currentVal = severities[pillarKey] ?? 0;
        const pillarLabel = labels?.[pillarKey] || config.label;

        return (
          <div
            key={pillarKey}
            className={`p-5 sm:p-6 rounded-2xl border shadow-sm transition-all flex flex-col gap-4 ${config.color}`}
          >
            <div className="flex justify-between items-center opacity-80">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">
                  {config.label}
                </span>
              </div>
              {currentVal > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-black/10 text-xs font-bold tracking-wider">
                  {currentVal}/10
                </span>
              )}
            </div>

            <p className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              {pillarLabel}
            </p>

            {/* Interactive Slider for Severity */}
            {currentVal > 0 && (
              <div className="mt-2 pt-3 border-t border-black/5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold opacity-70">1</span>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[currentVal]}
                    onValueChange={(vals) => onSeverityChange(pillarKey, vals[0])}
                    onValueCommit={(vals) => onSeverityCommit?.(pillarKey, vals[0])}
                    className="w-full flex-1 cursor-pointer [&_[data-slot=slider-range]]:bg-current [&_[data-slot=slider-thumb]]:border-current"
                  />
                  <span className="text-xs font-bold opacity-70">10</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
