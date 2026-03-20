"use client";

import { PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import { PieChart as PieChartIcon } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import InsightsCard from "@/components/shared/InsightsCard";
import { TopPieChartProps } from "../types/insightsTypes";
import { 
  PILLAR_COLORS, 
  WELLNESS_TITLE, 
  FIVE_PILLARS_SUBTITLE, 
  NO_WELLNESS_DATA, 
  LOG_SYMPTOMS_PROMPT, 
  TAP_SLICE_DETAILS 
} from "../constants/insightsConstants";

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[10px] font-black"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function TopPieChart({ data }: TopPieChartProps) {
  const [selected, setSelected] = useState<any>(null);

  if (!data || data.length === 0) return null;

  // Build ChartConfig from data array for shadcn
  const chartConfig = data.reduce((acc, entry) => {
    acc[entry.name.toLowerCase()] = {
      label: entry.name,
      color: PILLAR_COLORS[entry.name] || "#888",
    };
    return acc;
  }, {} as ChartConfig);

  const total = data.reduce((acc, entry) => acc + entry.value, 0);

  return (
    <InsightsCard
      title={WELLNESS_TITLE}
      subtitle={FIVE_PILLARS_SUBTITLE}
      subtitleClassName="text-[#C46747] font-bold"
      headerClassName="md:text-left pt-0" 
    >
      {/* Legend Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] p-5 shadow-sm flex flex-wrap justify-center gap-x-5 gap-y-3 w-full border border-slate-100">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full flex-shrink-0"
              style={{ backgroundColor: PILLAR_COLORS[entry.name] || "#888" }}
            />
            <span className="text-sm font-bold text-slate-700">{entry.name}</span>
          </div>
        ))}
      </div>

      {/* Central Pie Card / Empty State */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] shadow-sm p-4 flex flex-col items-center justify-center w-full border border-slate-100 min-h-[320px] animate-in fade-in duration-500">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-inner">
              <PieChartIcon className="h-10 w-10 text-slate-200" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">
                {NO_WELLNESS_DATA}
              </p>
              <p className="text-[10px] font-bold text-slate-300">
                {LOG_SYMPTOMS_PROMPT}
              </p>
            </div>
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="h-[250px] w-full aspect-auto"
            >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="name" hideLabel />}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius="95%"
              paddingAngle={1}
              dataKey="value"
              stroke="white"
              strokeWidth={2}
              labelLine={false}
              label={renderCustomizedLabel}
              onClick={(data) => setSelected(data)}
              isAnimationActive={false} 
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PILLAR_COLORS[entry.name] || "#888"}
                  className="cursor-pointer outline-none"
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {selected ? (
          <div className="mt-4 p-3 bg-slate-50 w-full rounded-xl border border-slate-100 flex justify-between items-center animate-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: PILLAR_COLORS[selected.name] }}
              />
              <span className="text-sm font-black text-slate-700">
                {selected.name}
              </span>
            </div>
            <span className="text-sm font-black text-[#C46747]">
              {Math.round((selected.value / total) * 100)}%
            </span>
          </div>
        ) : (
          <p className="text-center text-[10px] font-black tracking-widest text-slate-300 mt-4 uppercase">
            {TAP_SLICE_DETAILS}
          </p>
        )}
        </>
      )}
    </div>
  </InsightsCard>
);
}
