/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SummaryCard({ handleReset, summary }: any) {
  const categories = [
    { key: "physical", label: "PHYSICAL" },
    { key: "mood", label: "MOOD" },
    { key: "cognitive", label: "COGNITIVE" },
    { key: "sleep", label: "SLEEP" },
    { key: "social", label: "SOCIAL" },
  ];
  const activeCategories = categories.filter(cat => summary[cat.key] && summary[cat.key] !== "N/A");

  return (
    <Card className="bg-primary/5 border-primary/20 shadow-xl overflow-hidden rounded-[2rem] sm:rounded-[3rem]">
      <div className="bg-primary h-1.5 w-full" />
      <CardContent className="p-5 sm:p-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-primary tracking-tight uppercase">
            Analysis Pillars
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-full h-8 sm:h-9 text-xs sm:text-sm font-bold"
          >
            Clear
          </Button>
        </div>
        <div className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {activeCategories.map((cat) => (
              <div key={cat.key} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <span className="text-[10px] sm:text-xs font-black uppercase text-secondary/60 tracking-[0.2em] block mb-1">
                  {cat.label}
                </span>
                <p className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
                  {summary[cat.key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
