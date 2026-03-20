"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DailyAverage } from "../types/insightsTypes";
import { SYMPTOM_FULL_NAMES } from "../constants/insightsChartsConfig";
import SymptomBarChart from "./SymptomBarChart";

function processRecharts(data: DailyAverage | null) {
  if (!data) return [];
  return (Object.entries(data) as [string, number][]).map(([k, v]) => ({
    name: SYMPTOM_FULL_NAMES[k.toLowerCase()] || k,
    score: v,
  }));
}

interface ComparisonCardsProps {
  dateA: Date;
  dateB: Date;
  joinedAt: Date;
  onChangeDateA: (date: Date) => void;
  onChangeDateB: (date: Date) => void;
  dataA: DailyAverage | null;
  dataB: DailyAverage | null;
  loading: boolean;
}

export default function ComparisonCards({
  dateA,
  dateB,
  joinedAt,
  onChangeDateA,
  onChangeDateB,
  dataA,
  dataB,
  loading,
}: ComparisonCardsProps) {
  const [selectedA, setSelectedA] = useState<any>(null);
  const [selectedB, setSelectedB] = useState<any>(null);

  const chartA = processRecharts(dataA);
  const chartB = processRecharts(dataB);

  const minDate = format(joinedAt, "yyyy-MM-dd");
  const maxDate = format(new Date(), "yyyy-MM-dd");

  return (
    <div
      className="flex flex-col items-stretch relative w-full mx-auto"
      style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.3s" }}
    >
      {/* Card A */}
      <div className="w-full bg-gradient-to-b from-[#2A5174] to-[#163554] rounded-[1.5rem] overflow-hidden shadow-xl flex flex-col">
        <div className="p-4 pb-2 text-white">
          <div className="bg-white/10 rounded-xl overflow-hidden">
            <input
              type="date"
              className="w-full bg-transparent text-white font-bold text-base px-3 py-2 outline-none"
              style={{ colorScheme: "dark" }}
              value={format(dateA, "yyyy-MM-dd")}
              min={minDate}
              max={maxDate}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const d = new Date(val.replace(/-/g, "/"));
                if (!isNaN(d.getTime())) onChangeDateA(d);
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-t-[1.5rem] p-4 mt-3 flex-1">
          <SymptomBarChart
            data={chartA}
            gradientId="colorA"
            gradientColors={{ start: "#4A81AD", end: "#163554" }}
            selectedSymptom={selectedA}
            onSelectSymptom={setSelectedA}
            accentColor="#2A5174"
          />
        </div>
      </div>

      {/* VS Badge between the two cards */}
      <div className="flex items-center justify-center z-10 py-2">
        <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-xs border-2 border-white shadow-lg">
          VS
        </div>
      </div>

      {/* Card B */}
      <div className="w-full bg-gradient-to-b from-[#C46747] to-[#A84A2A] rounded-[1.5rem] overflow-hidden shadow-xl flex flex-col">
        <div className="p-4 pb-2 text-white">
          <div className="bg-white/10 rounded-xl overflow-hidden">
            <input
              type="date"
              className="w-full bg-transparent text-white font-bold text-base px-3 py-2 outline-none"
              style={{ colorScheme: "dark" }}
              value={format(dateB, "yyyy-MM-dd")}
              min={minDate}
              max={maxDate}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const d = new Date(val.replace(/-/g, "/"));
                if (!isNaN(d.getTime())) onChangeDateB(d);
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-t-[1.5rem] p-4 mt-3 flex-1">
          <SymptomBarChart
            data={chartB}
            gradientId="colorB"
            gradientColors={{ start: "#DF7B5A", end: "#A84A2A" }}
            selectedSymptom={selectedB}
            onSelectSymptom={setSelectedB}
            accentColor="#C46747"
          />
        </div>
      </div>
    </div>
  );
}
