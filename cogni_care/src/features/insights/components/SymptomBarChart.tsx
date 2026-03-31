"use client";

import { Bar, BarChart, XAxis, YAxis, Cell, CartesianGrid } from "recharts";
import { BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  getSymptomEmoji,
  getPillarColor,
  TAP_BAR_DETAILS,
  NO_DATA_RECORD_DATE,
  SYMPTOM_BAR_CHART_CONFIG
} from "../constants/insightsConstants";
import { SymptomBarChartProps } from "../types/insightsTypes";

export default function SymptomBarChart({
  data,
  gradientId,
  gradientColors,
  selectedSymptom,
  onSelectSymptom,
  accentColor,
}: SymptomBarChartProps) {
  const hasData = data && data.some((d) => d.score > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 h-40 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3 animate-in fade-in duration-500">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
          <BarChart2 className="h-6 w-6 text-slate-300" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
          {NO_DATA_RECORD_DATE}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <ChartContainer config={SYMPTOM_BAR_CHART_CONFIG} className="h-40 w-full aspect-auto">
        <BarChart
          data={data}
          margin={{ top: 10, left: -20, right: 0, bottom: 0 }}
          onClick={(state) => {
            if (state && state.activePayload && state.activePayload.length > 0) {
              onSelectSymptom(state.activePayload[0].payload);
            }
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColors.start} stopOpacity={5} />
              <stop offset="95%" stopColor={gradientColors.end} stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
          />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 8, fill: "#888", fontWeight: 600 }}
            dy={8}
            interval={0}
            tickFormatter={(val) => getSymptomEmoji(val)}
          />
          <YAxis
            domain={[0, 10]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 9, fill: "#94A3B8" }}
            tickCount={6}
          />
          <ChartTooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            content={<ChartTooltipContent nameKey="name" />}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => {
              const isSelected = selectedSymptom?.name === entry.name;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#${gradientId})`}
                  className={cn(
                    "cursor-pointer outline-none transition-all duration-300",
                    isSelected ? "opacity-100" : selectedSymptom ? "opacity-40" : "opacity-100"
                  )}
                  stroke={isSelected ? accentColor : "none"}
                  strokeWidth={2}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ChartContainer>

      {selectedSymptom ? (
        <div className="mt-4 p-3 bg-sky-50/70 w-full rounded-xl border border-sky-100 flex justify-between items-center animate-in slide-in-from-top-1 duration-200">
          <span className="text-sm font-black" style={{ color: getPillarColor(selectedSymptom.name) }}>
            {selectedSymptom.name}
          </span>
          <span className="text-sm font-black text-slate-400">
            {selectedSymptom.score} / 10
          </span>
        </div>
      ) : (
        <p className="text-center text-[10px] font-black tracking-widest text-slate-400 mt-4 uppercase">
          {TAP_BAR_DETAILS}
        </p>
      )}
    </div>
  );
}
