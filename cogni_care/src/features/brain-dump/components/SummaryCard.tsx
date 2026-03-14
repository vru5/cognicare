/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ANALYSIS_PILLAR, CLEAR } from "@/constants/brainDumpPage";
import { Activity, Smile, Brain, Moon, Users } from "lucide-react";

export default function SummaryCard({ handleReset, summary }: any) {
  const pillarConfig: any = {
    physical: { icon: Activity, color: "bg-red-100 text-red-700 border-red-200", label: "Physical" },
    mood: { icon: Smile, color: "bg-purple-100 text-purple-700 border-purple-200", label: "Mood" },
    cognitive: { icon: Brain, color: "bg-blue-100 text-blue-700 border-blue-200", label: "Cognitive" },
    sleep: { icon: Moon, color: "bg-indigo-100 text-indigo-700 border-indigo-200", label: "Sleep" },
    social: { icon: Users, color: "bg-green-100 text-green-700 border-green-200", label: "Social" },
  };

  const categories = [
    { key: "physical", label: "PHYSICAL" },
    { key: "mood", label: "MOOD" },
    { key: "cognitive", label: "COGNITIVE" },
    { key: "sleep", label: "SLEEP" },
    { key: "social", label: "SOCIAL" },
  ];

  const activeCategories = categories.filter(cat => summary[cat.key] && summary[cat.key] !== "N/A");

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
            const config = pillarConfig[cat.key];
            const Icon = config.icon;

            return (
              <div
                key={cat.key}
                className={`p-5 sm:p-6 rounded-3xl border shadow-sm transition-all hover:scale-[1.02] flex flex-col gap-3 ${config.color}`}
              >
                <div className="flex items-center gap-2 opacity-80">
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    {config.label}
                  </span>
                </div>
                <p className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                  {summary[cat.key]}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
