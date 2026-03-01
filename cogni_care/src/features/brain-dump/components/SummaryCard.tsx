/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SummaryCard({ handleReset, summary}: any) {
  return (
    <Card className="bg-primary/5 border-primary/20 shadow-xl overflow-hidden">
      <div className="bg-primary h-1.5 w-full" />
      <CardContent className="p-8">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-black text-primary tracking-tight">
            Analysis Summary
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-full"
          >
            New Entry
          </Button>
        </div>
        <div className="space-y-6">
          <p className="text-slate-700 font-medium">{summary.message}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <span className="text-xs font-black uppercase text-secondary tracking-widest block mb-2">
                Physical Insight
              </span>
              <p className="text-xl font-bold text-slate-800">
                {summary.physical}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <span className="text-xs font-black uppercase text-secondary tracking-widest block mb-2">
                Cognitive Insight
              </span>
              <p className="text-xl font-bold text-slate-800">
                {summary.cognitive}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
