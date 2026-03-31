import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ANALYSIS_PILLAR, CLEAR } from "@/constants/brainDumpPage";
import { SymptomPillar, LogSummaryCard } from "@/features/logs/types/logTypes";
import { updateBrainDumpSeverity } from "../services/updateSeverity";
import SymptomSeveritySliders from "@/features/logs/components/SymptomSeveritySliders";
import { PILLAR_CATEGORIES } from "@/features/logs/constants/pillarConfig";
import { useAuth } from "@/contexts/AuthContext";

interface SummaryCardProps {
  handleReset: () => void;
  summary: LogSummaryCard;
  showSaveButton?: boolean;
  onSave?: () => void;
  showClearButton?: boolean;
  flat?: boolean;
  onSeverityUpdate?: (pillar: SymptomPillar, value: number) => void;
}

export default function SummaryCard({ 
  handleReset, 
  summary, 
  showSaveButton, 
  onSave,
  showClearButton = true,
  flat = false,
  onSeverityUpdate
}: SummaryCardProps) {
  const { user } = useAuth();
  const isCarer = user?.role === "CARER";
  
  const [localSeverities, setLocalSeverities] = useState<Record<string, number | null>>({});

  useEffect(() => {
    // Initialize or sync local severities from props
    const newSeverities: Record<string, number | null> = {};
    const pillars: SymptomPillar[] = ["physical", "mood", "cognitive", "sleep", "social"];
    pillars.forEach(p => {
      newSeverities[p] = summary[`${p}Severity` as keyof LogSummaryCard] as number | null ?? null;
    });
    setLocalSeverities(newSeverities);
  }, [summary]);

  const handleSliderChange = (pillar: SymptomPillar, value: number) => {
    setLocalSeverities(prev => ({ ...prev, [pillar]: value }));
  };

  const handleSliderCommit = async (pillar: SymptomPillar, value: number) => {
    if (summary.id) {
      await updateBrainDumpSeverity(summary.id, pillar, value);
      if (onSeverityUpdate) {
        onSeverityUpdate(pillar, value);
      }
    }
  };

  const activeCategories = PILLAR_CATEGORIES.filter(
    (cat) => summary[cat.key] && summary[cat.key] !== "N/A",
  ).map(cat => cat.key);

  const content = (
    <div className={`${flat ? "" : "p-6 sm:p-10"}`}>
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
        <div className="flex gap-2">
          {showSaveButton && isCarer && (
            <Button
              onClick={onSave}
              className="rounded-xl h-10 px-8 text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all"
            >
              Save
            </Button>
          )}
          {showClearButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="rounded-xl h-10 px-6 text-sm font-bold border-2 hover:bg-destructive hover:text-white transition-all"
            >
              {CLEAR}
            </Button>
          )}
        </div>
      </div>

      <SymptomSeveritySliders
        activePillars={activeCategories}
        severities={localSeverities}
        onSeverityChange={handleSliderChange}
        onSeverityCommit={handleSliderCommit}
        labels={summary as unknown as Record<string, string | null | undefined>}
      />
    </div>
  );

  if (flat) {
    return content;
  }

  return (
    <Card className="bg-white border-border shadow-2xl overflow-hidden rounded-3xl">
      {/* Subtle top indicator */}
      <div className="bg-primary/20 h-1.5 w-full" />
      <CardContent className="p-0">
        {content}
      </CardContent>
    </Card>
  );
}
