"use client";

import { useState, useEffect, useMemo } from "react";
import { format, subDays, subMonths } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, Loader2, Lock, Sparkles, ArrowRight, ChevronUp, Telescope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MobilePageLayout from "@/components/shared/MobilePageLayout";
import {
  getInsightsEligibility,
  getSymptomAggregate,
  getMajorSymptoms,
  getAiSummary,
  getPredictiveAnalysis,
} from "../services/insightsService";
import {
  DailyAverage,
  MajorSymptomsResponse,
  SymptomDataPoint,
  AiInsightSummary,
  PredictiveAnalysis,
  InsightsDashboardProps,
} from "../types/insightsTypes";
import {
  HEALTH_REPORT_TITLE,
  SYMPTOM_COMPARISON_SUBTITLE,
  DATE_PRESETS,
  INSIGHTS_LOCKED_TITLE,
  INSIGHTS_LOCKED_DESCRIPTION,
  PROGRESS_LABEL,
  PROGRESS_DAYS_FOOTER,
  INSIGHTS_TITLE,
} from "../constants/insightsConstants";

import MajorSymptomsCard from "./MajorSymptomsCard";
import InsightsCard from "@/components/shared/InsightsCard";
import ExportMenu from "@/features/export/components/ExportMenu";
import DateRangePicker from "@/components/shared/DateRangePicker";
import SymptomBarChart from "./SymptomBarChart";
import AiInsightSection from "./AiInsightSection";
import PredictiveAnalysisSection from "./PredictiveAnalysisSection";
import CalculationModal from "./CalculationModal";
import HelpTooltip from "@/components/shared/HelpTooltip";

export default function InsightsDashboard({
  patientId,
  accentColor,
}: InsightsDashboardProps) {
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
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [showPredictive, setShowPredictive] = useState(false);

  // Date State
  const [preset, setPreset] = useState<
    "day" | "7d" | "15d" | "1m" | "3m" | "6m" | "custom"
  >("day");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });

  // Data State
  const [aggregateData, setAggregateData] = useState<DailyAverage | null>(null);
  const [majorSymptoms, setMajorSymptoms] = useState<MajorSymptomsResponse>({
    topSymptoms: [],
    alerts: [],
  });
  const [selectedSymptom, setSelectedSymptom] =
    useState<SymptomDataPoint | null>(null);
  const [aiSummary, setAiSummary] = useState<AiInsightSummary | null>(null);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<PredictiveAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingPredictive, setLoadingPredictive] = useState(false);
  const [errorPredictive, setErrorPredictive] = useState<string | null>(null);
  const [helpModalType, setHelpModalType] = useState<"symptoms" | "average" | "predictive" | null>(null);

  // Initial Setup: Eligibility & Major Symptoms
  useEffect(() => {
    async function init() {
      setLoading(true);
      const [elig, symptoms] = await Promise.all([
        getInsightsEligibility(patientId),
        getMajorSymptoms(patientId),
      ]);

      if (elig) {
        setEligible(elig.eligible);
        setDaysCount(elig.days);
        setHasOneMonthData(elig.hasOneMonthData);
        setJoinedAt(new Date(elig.joinedAt));
      }
      if (symptoms) setMajorSymptoms(symptoms);
      setLoading(false);
    }
    init();
  }, [patientId]);

  // Handle preset selection and range updates
  const handlePresetChange = (newPreset: typeof preset) => {
    setPreset(newPreset);
    if (newPreset === "custom") return;

    const end = new Date();
    let start = new Date();

    switch (newPreset) {
      case "day":
        start = end;
        break;
      case "7d":
        start = subDays(end, 7);
        break;
      case "15d":
        start = subDays(end, 15);
        break;
      case "1m":
        start = subMonths(end, 1);
        break;
      case "3m":
        start = subMonths(end, 3);
        break;
      case "6m":
        start = subMonths(end, 6);
        break;
    }

    setDateRange({ start, end });
  };

  // Fetch Aggregate Data when range changes
  useEffect(() => {
    if (!eligible) return;

    async function fetchData() {
      setFetchingData(true);
      setLoadingAi(true);

      const [data, ai] = await Promise.all([
        getSymptomAggregate(patientId, dateRange.start, dateRange.end),
        getAiSummary(patientId, dateRange.start, dateRange.end),
      ]);

      setAggregateData(data);
      setAiSummary(ai);
      setSelectedSymptom(null);
      setShowAiInsights(false); 
      setShowPredictive(false);
      setErrorPredictive(null);
      setFetchingData(false);
      setLoadingAi(false);
    }
    fetchData();
  }, [patientId, eligible, dateRange.start, dateRange.end]);

  const handleFetchPredictive = async () => {
    if (predictiveAnalysis) {
      setShowPredictive(true);
      return;
    }
    setLoadingPredictive(true);
    setErrorPredictive(null);
    const data = await getPredictiveAnalysis(patientId);
    if (data) {
      setPredictiveAnalysis(data);
      setShowPredictive(true);
    } else {
      setErrorPredictive("API quota reached or server error. Please try again in a few minutes.");
    }
    setLoadingPredictive(false);
  };

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
        <div
          className="w-8 h-8 border-4 border-slate-200 border-t-transparent rounded-full animate-spin"
          style={{ borderTopColor: accentColor }}
        />
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
      headerBottom={
        eligible ? (
          <ExportMenu
            patientId={patientId}
            startDate={dateRange.start}
            endDate={dateRange.end}
            joinedAt={joinedAt}
            accentColor={accentColor}
            majorSymptoms={majorSymptoms}
          />
        ) : null
      }
    >
      {loading ? (
        <div className="flex w-full items-center justify-center p-32">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : !eligible ? (
        <div className="flex flex-col items-center justify-center w-full min-h-[65vh] text-center p-8 bg-white rounded-[2rem] shadow-2xl mt-6 border border-white/20 animate-in zoom-in-95 duration-500">
          <div className="relative w-32 h-32 mb-10 group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse group-hover:bg-primary/30 transition-colors" />
            <div className="relative w-full h-full bg-gradient-to-br from-white to-slate-50 rounded-full flex items-center justify-center shadow-xl border border-white">
              <Lock className="w-12 h-12 text-primary/40" />
            </div>
          </div>

          <h2 className="text-4xl font-black mb-4 text-slate-800 tracking-tight">
            {INSIGHTS_LOCKED_TITLE.split(" ")[0]}
            <br />
            <span className="text-primary italic">
              {INSIGHTS_LOCKED_TITLE.split(" ")[1]}
            </span>
          </h2>

          <p className="text-slate-500 max-w-[280px] text-base font-bold leading-relaxed mb-12">
            {INSIGHTS_LOCKED_DESCRIPTION.split("7 distinct days")[0]}
            <span className="text-primary">7 distinct days</span>
            {INSIGHTS_LOCKED_DESCRIPTION.split("7 distinct days")[1]}
          </p>

          <div className="w-full max-w-[240px] space-y-3">
            <div className="flex justify-between items-end px-1">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                {PROGRESS_LABEL}
              </span>
              <span className="text-sm font-black text-primary">
                {daysCount} / 7 days
              </span>
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
          <MajorSymptomsCard
            alerts={majorSymptoms.alerts}
            symptoms={majorSymptoms.topSymptoms}
            accentColor={accentColor}
            onHelpClick={() => setHelpModalType("symptoms")}
          />

          <div className="space-y-4">
            <InsightsCard
              title={HEALTH_REPORT_TITLE}
              subtitle={SYMPTOM_COMPARISON_SUBTITLE}
              accentColor={accentColor}
              onHelpClick={() => setHelpModalType("average")}
            >
              <div className="space-y-8">
                {/* Range Presets Selector */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {DATE_PRESETS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() =>
                        !(fetchingData || loadingAi) &&
                        handlePresetChange(p.key)
                      }
                      disabled={fetchingData || loadingAi}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${
                          preset === p.key
                            ? "bg-slate-900 text-white shadow-lg scale-105"
                            : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        }
                        ${
                          fetchingData || loadingAi
                            ? "opacity-50 cursor-not-allowed"
                            : ""
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
                      disabled={fetchingData || loadingAi}
                      onRangeChange={(start, end) =>
                        setDateRange({ start, end })
                      }
                    />
                  </div>
                )}

                {/* AI Processing / Main Content Transition */}
                <AnimatePresence mode="wait">
                  {fetchingData || loadingAi ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="flex flex-col items-center justify-center py-20 px-8 text-center bg-gradient-to-br from-sky-50 to-white rounded-[2rem] border border-sky-100 shadow-xl shadow-sky-900/5 my-4 overflow-hidden relative"
                    >
                      {/* Decorative Background Elements */}
                      <div className="absolute top-0 left-0 w-32 h-32 bg-sky-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                      <div className="relative mb-8">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-lg border border-sky-50 flex items-center justify-center relative z-10 animate-bounce duration-[2000ms]">
                          <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                        </div>
                        <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl animate-pulse" />
                      </div>

                      <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                        Getting AI Insights
                      </h3>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-8"
                    >
                      {/* Aggregated Chart View */}
                      <div className="relative">
                        <div className="mb-4 flex flex-col items-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Combined Average
                          </p>
                          <p className="text-xs font-bold text-slate-50">
                            {format(dateRange.start, "MMM d")} —{" "}
                            {format(dateRange.end, "MMM d, yyyy")}
                          </p>
                        </div>

                        <SymptomBarChart
                          data={chartData}
                          gradientId="combined"
                          gradientColors={{
                            start: accentColor,
                            end: accentColor + "44",
                          }}
                          accentColor={accentColor}
                          selectedSymptom={selectedSymptom}
                          onSelectSymptom={setSelectedSymptom}
                        />
                      </div>

                      {/* AI & Predictive Insights Reveal Logic */}
                      <div className="pt-0 flex flex-col items-center gap-4 w-full">
                        <AnimatePresence mode="wait">
                          {!showAiInsights && !showPredictive ? (
                            <motion.div
                              key="view-btns-container"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex flex-col gap-4 w-full mt-2"
                            >
                              <button
                                onClick={() => setShowAiInsights(true)}
                                className="group relative w-full px-10 py-5 bg-gradient-to-br from-primary to-[#0A4B75] text-white rounded-[2rem] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] hover:shadow-primary/30 overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <span className="text-base font-black tracking-tight flex items-center gap-3">
                                  See AI Insights 
                                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                              </button>

                              <button
                                onClick={handleFetchPredictive}
                                disabled={loadingPredictive}
                                className="group relative w-full px-10 py-5 bg-gradient-to-br from-primary to-[#0A4B75] text-white rounded-[2rem] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] hover:shadow-primary/30 overflow-hidden"
                              >
                                {/* Button Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                
                                {loadingPredictive ? (
                                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                                ) : (
                                  <span className="text-base font-black tracking-tight flex items-center gap-3">
                                    See Predictive Analysis
                                    <Telescope className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                  </span>
                                )}
                              </button>
                            </motion.div>
                          ) : showAiInsights ? (
                            <motion.div
                              key="ai-content"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                              className="overflow-hidden w-full"
                            >
                              <div className="flex items-center justify-between mb-6 mt-4 px-2">
                                <div className="px-4 py-1 bg-primary/10 rounded-full border border-primary/20">
                                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">AI Clinical Analysis</span>
                                </div>
                                <button 
                                  onClick={() => setShowAiInsights(false)}
                                  className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-primary active:scale-90 transition-all"
                                >
                                  <ChevronUp className="w-5 h-5" />
                                </button>
                              </div>

                              {aiSummary ? (
                                <AiInsightSection
                                  insights={aiSummary}
                                  accentColor={accentColor}
                                />
                              ) : (
                                <div className="text-center py-12 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                                  <p className="text-xs font-bold text-slate-400">
                                    Add more logs to generate AI insights.
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="predictive-content"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                              className="overflow-hidden w-full"
                            >
                              <div className="flex items-center justify-between mb-6 mt-4 px-2">
                                <div className="px-4 py-1 bg-amber-50 rounded-full border border-amber-200">
                                  <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">7-Day Health Outlook</span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <HelpTooltip 
                                    content={(close) => (
                                      <>
                                        Learn more how the prediction is generated{" "}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            close();
                                            setHelpModalType("predictive");
                                          }}
                                          className="inline font-black text-white underline decoration-sky-300 underline-offset-2 hover:text-sky-200 transition-colors uppercase tracking-widest"
                                        >
                                          here
                                        </button>
                                      </>
                                    )}
                                    buttonClassName="w-4 h-4"
                                  />
                                  <button 
                                    onClick={() => setShowPredictive(false)}
                                    className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-primary active:scale-90 transition-all"
                                  >
                                    <ChevronUp className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>

                              {predictiveAnalysis ? (
                                <PredictiveAnalysisSection
                                  analysis={predictiveAnalysis}
                                  accentColor={accentColor}
                                />
                              ) : (
                                <div className="text-center py-12 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                                  <p className="text-xs font-bold text-rose-500 max-w-[200px] mx-auto">
                                    {errorPredictive || "Could not generate predictive analysis."}
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </InsightsCard>
          </div>
        </div>
      )}
      <CalculationModal 
        isOpen={!!helpModalType} 
        type={helpModalType || "symptoms"}
        onClose={() => setHelpModalType(null)} 
      />
    </MobilePageLayout>
  );
}
