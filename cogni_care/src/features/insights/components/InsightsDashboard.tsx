"use client";

import { useState, useEffect, useMemo } from "react";
import { format, subDays, subMonths } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, Loader2, Lock } from "lucide-react";
import MobilePageLayout from "@/components/shared/MobilePageLayout";
import {
  getInsightsEligibility,
  getSymptomAggregate,
  getMajorSymptoms
} from "../services/insightsService";
import {
  DailyAverage,
  MajorSymptomsResponse,
  SymptomDataPoint
} from "../types/insightsTypes";
import {
  HEALTH_REPORT_TITLE,
  SYMPTOM_COMPARISON_SUBTITLE,
  DATE_PRESETS,
  INSIGHTS_LOCKED_TITLE,
  INSIGHTS_LOCKED_DESCRIPTION,
  PROGRESS_LABEL,
  PROGRESS_DAYS_FOOTER,
  INSIGHTS_TITLE
} from "../constants/insightsConstants";

import MajorSymptomsCard from "./MajorSymptomsCard";
import InsightsCard from "@/components/shared/InsightsCard";
import ExportMenu from "@/features/export/components/ExportMenu";
import DateRangePicker from "@/components/shared/DateRangePicker";
import SymptomBarChart from "./SymptomBarChart";

export default function InsightsDashboard({ patientId, accentColor }: { patientId: string; accentColor: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPatientId = searchParams?.get("patientId");

  // UI State
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [daysCount, setDaysCount] = useState(0);
  const [hasOneMonthData, setHasOneMonthData] = useState<boolean>(false);
  const [joinedAt, setJoinedAt] = useState<Date>(new Date());

  // Date State
  const [preset, setPreset] = useState<"day" | "7d" | "15d" | "1m" | "3m" | "6m" | "custom">("day");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date()
  });

  // Data State
  const [aggregateData, setAggregateData] = useState<DailyAverage | null>(null);
  const [majorSymptoms, setMajorSymptoms] = useState<MajorSymptomsResponse>({ topSymptoms: [], alerts: [] });
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomDataPoint | null>(null);

  // Initial Setup: Eligibility & Major Symptoms
  useEffect(() => {
    async function init() {
      setLoading(true);
      const [elig, symptoms] = await Promise.all([
        getInsightsEligibility(patientId),
        getMajorSymptoms(patientId)
      ]);

      if (elig) {
        setEligible(elig.eligible);
        setDaysCount(elig.days);
        setJoinedAt(new Date(elig.joinedAt));
      }
      if (symptoms) setMajorSymptoms(symptoms);
      setLoading(false);
    }
    init();
  }, [patientId]);

  // Update dates when preset changes
  useEffect(() => {
    if (preset === "custom") return;

    const end = new Date();
    let start = new Date();

    switch (preset) {
      case "day": start = end; break;
      case "7d": start = subDays(end, 7); break;
      case "15d": start = subDays(end, 15); break;
      case "1m": start = subMonths(end, 1); break;
      case "3m": start = subMonths(end, 3); break;
      case "6m": start = subMonths(end, 6); break;
    }

    setDateRange({ start, end });
  }, [preset]);

  // Fetch Aggregate Data when range changes
  useEffect(() => {
    if (!eligible) return;

    async function fetchData() {
      setFetchingData(true);
      const data = await getSymptomAggregate(patientId, dateRange.start, dateRange.end);
      setAggregateData(data);
      setSelectedSymptom(null);
      setFetchingData(false);
    }
    fetchData();
  }, [patientId, eligible, dateRange.start, dateRange.end]);

  // Format data for chart
  const chartData = useMemo(() => {
    if (!aggregateData) return [];
    return [
      { name: "physical", score: aggregateData.physical },
      { name: "mood", score: aggregateData.mood },
      { name: "cognitive", score: aggregateData.cognitive },
      { name: "sleep", score: aggregateData.sleep },
      { name: "social", score: aggregateData.social },
    ];
  }, [aggregateData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: accentColor }} />
      </div>
    );
  }

  return (
    <MobilePageLayout
      title={INSIGHTS_TITLE}
      icon={Activity}
      onBack={urlPatientId ? () => router.push("/insights") : undefined}
      iconContainerClass="bg-gradient-to-br from-primary to-[#0A4B75] shadow-lg shadow-primary/20"
      iconColorClass="text-white"
      headerBottom={eligible ? (
        <ExportMenu
          patientId={patientId}
          startDate={dateRange.start}
          endDate={dateRange.end}
          joinedAt={joinedAt}
          accentColor={accentColor}
        />
      ) : null}
    >
      {loading ? (
        <div className="flex w-full items-center justify-center p-32"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
      ) : !eligible ? (
        <div className="flex flex-col items-center justify-center w-full min-h-[65vh] text-center p-8 bg-white rounded-[3rem] shadow-2xl mt-6 border border-white/20 animate-in zoom-in-95 duration-500">
          <div className="relative w-32 h-32 mb-10 group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse group-hover:bg-primary/30 transition-colors" />
            <div className="relative w-full h-full bg-gradient-to-br from-white to-slate-50 rounded-full flex items-center justify-center shadow-xl border border-white">
              <Lock className="w-12 h-12 text-primary/40" />
            </div>
          </div>

          <h2 className="text-4xl font-black mb-4 text-slate-800 tracking-tight">
            {INSIGHTS_LOCKED_TITLE.split(" ")[0]}<br /><span className="text-primary italic">{INSIGHTS_LOCKED_TITLE.split(" ")[1]}</span>
          </h2>

          <p className="text-slate-500 max-w-[280px] text-base font-bold leading-relaxed mb-12">
            {INSIGHTS_LOCKED_DESCRIPTION.split("7 distinct days")[0]}<span className="text-primary">7 distinct days</span>{INSIGHTS_LOCKED_DESCRIPTION.split("7 distinct days")[1]}
          </p>

          <div className="w-full max-w-[240px] space-y-3">
            <div className="flex justify-between items-end px-1">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{PROGRESS_LABEL}</span>
              <span className="text-sm font-black text-primary">{daysCount} / 7 days</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-50 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-primary to-[#0A4B75] rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${Math.min((daysCount / 7) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[11px] font-black text-slate-300 italic">
              {PROGRESS_DAYS_FOOTER(7 - daysCount)}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <MajorSymptomsCard alerts={majorSymptoms.alerts} accentColor={accentColor} />

          {!eligible ? (
            <InsightsCard
              title={INSIGHTS_LOCKED_TITLE}
              subtitle={INSIGHTS_LOCKED_DESCRIPTION}
              accentColor={accentColor}
              isLocked
            >
              <div className="flex flex-col items-center space-y-6 py-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                    <circle
                      cx="64" cy="64" r="58"
                      fill="transparent"
                      stroke={accentColor}
                      strokeWidth="12"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * (Math.min(daysCount, 7) / 7))}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black" style={{ color: accentColor }}>{daysCount}</span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{PROGRESS_LABEL}</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-400">{PROGRESS_DAYS_FOOTER(Math.max(0, 7 - daysCount))}</p>
              </div>
            </InsightsCard>
          ) : (
            <div className="space-y-4">
              <InsightsCard
                title={HEALTH_REPORT_TITLE}
                subtitle={SYMPTOM_COMPARISON_SUBTITLE}
                accentColor={accentColor}
              >
                <div className="space-y-8">
                  {/* Range Presets Selector */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {DATE_PRESETS.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setPreset(p.key)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${preset === p.key
                            ? "bg-slate-900 text-white shadow-lg scale-105"
                            : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          }
                      `}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Range Picker */}
                  {preset === "custom" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <DateRangePicker
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        minDate={joinedAt}
                        maxDate={new Date()}
                        accentColor={accentColor}
                        onRangeChange={(start, end) => setDateRange({ start, end })}
                      />
                    </div>
                  )}

                  {/* Aggregated Chart View */}
                  <div className={`relative min-h-[250px] transition-all duration-300 ${fetchingData ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'}`}>
                    <div className="mb-6 flex flex-col items-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Combined Average</p>
                      <p className="text-xs font-bold text-slate-500">
                        {format(dateRange.start, "MMM d")} — {format(dateRange.end, "MMM d, yyyy")}
                      </p>
                    </div>

                    <SymptomBarChart
                      data={chartData}
                      gradientId="combined"
                      gradientColors={{ start: accentColor, end: accentColor + "44" }}
                      accentColor={accentColor}
                      selectedSymptom={selectedSymptom}
                      onSelectSymptom={setSelectedSymptom}
                    />
                  </div>
                </div>
              </InsightsCard>
            </div>
          )}
        </div>
      )}
    </MobilePageLayout>
  );
}
