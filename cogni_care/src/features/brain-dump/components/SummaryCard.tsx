import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ANALYSIS_PILLAR, CLEAR } from "@/constants/brainDumpPage";
import { MoodPillarsConfig, SymptomPillar } from "@/features/logs/types/logTypes";
import { AnalysisCard } from "../types/analysisSummaryCard";
import { Activity, Smile, Brain, Moon, Users, LucideIcon } from "lucide-react";
import { updateBrainDumpSeverity } from "../services/updateSeverity";

interface SummaryCardProps {
  handleReset: () => void;
  summary: AnalysisCard;
}

export default function SummaryCard({ handleReset, summary }: SummaryCardProps) {
  const [localSeverities, setLocalSeverities] = useState<Record<string, number | null>>({});

  useEffect(() => {
    // Initialize or sync local severities from props
    const newSeverities: Record<string, number | null> = {};
    const pillars: SymptomPillar[] = ["physical", "mood", "cognitive", "sleep", "social"];
    pillars.forEach(p => {
      newSeverities[p] = summary[`${p}Severity` as keyof AnalysisCard] as number | null ?? null;
    });
    setLocalSeverities(newSeverities);
  }, [summary]);

  const handleSliderChange = (pillar: SymptomPillar, value: number) => {
    setLocalSeverities(prev => ({ ...prev, [pillar]: value }));
  };

  const handleSliderCommit = async (pillar: SymptomPillar, value: number) => {
    if (summary.logId) {
      await updateBrainDumpSeverity(summary.logId, pillar, value);
    }
  };

  const pillarConfig: MoodPillarsConfig = {
    physical: {
      icon: Activity,
      color: "bg-red-100 text-red-700 border-red-200",
      label: "Physical",
    },
    mood: {
      icon: Smile,
      color: "bg-purple-100 text-purple-700 border-purple-200",
      label: "Mood",
    },
    cognitive: {
      icon: Brain,
      color: "bg-blue-100 text-blue-700 border-blue-200",
      label: "Cognitive",
    },
    sleep: {
      icon: Moon,
      color: "bg-indigo-100 text-indigo-700 border-indigo-200",
      label: "Sleep",
    },
    social: {
      icon: Users,
      color: "bg-green-100 text-green-700 border-green-200",
      label: "Social",
    },
  };

  const categories: { key: SymptomPillar; label: string }[] = [
    { key: "physical", label: "PHYSICAL" },
    { key: "mood", label: "MOOD" },
    { key: "cognitive", label: "COGNITIVE" },
    { key: "sleep", label: "SLEEP" },
    { key: "social", label: "SOCIAL" },
  ];

  const activeCategories = categories.filter(
    (cat) => summary[cat.key] && summary[cat.key] !== "N/A",
  );

  return (
    <Card className="bg-white border-border shadow-2xl overflow-hidden rounded-[2rem] sm:rounded-[3rem]">
      {/* Subtle top indicator */}
      <div className="bg-primary/20 h-1.5 w-full" />

      <CardContent className="p-6 sm:p-10">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-secondary-foreground tracking-tight uppercase">
              {ANALYSIS_PILLAR}
            </h3>
            {summary.message && (
              <p className="text-sm font-medium text-muted-foreground/80 italic">
                {summary.message}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-full h-10 px-6 text-sm font-bold border-2 hover:bg-destructive hover:text-white transition-all"
          >
            {CLEAR}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {activeCategories.map((cat) => {
            const config = pillarConfig[cat.key as SymptomPillar];
            if (!config) return null;
            const Icon = config.icon as LucideIcon;
            const currentVal = localSeverities[cat.key] ?? 0;

            return (
              <div
                key={cat.key}
                className={`p-5 sm:p-6 rounded-3xl border shadow-sm transition-all flex flex-col gap-4 ${config.color}`}
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
                
                <p className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                  {summary[cat.key]}
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
                        onValueChange={(vals) => handleSliderChange(cat.key as SymptomPillar, vals[0])}
                        onValueCommit={(vals) => handleSliderCommit(cat.key as SymptomPillar, vals[0])}
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
      </CardContent>
    </Card>
  );
}
