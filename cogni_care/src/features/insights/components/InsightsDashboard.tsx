"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { subDays, startOfToday } from "date-fns"
import { Loader2, Lock, Activity } from "lucide-react"
import MobilePageLayout from "@/components/shared/MobilePageLayout"

import {
  getInsightsEligibility,
  getAllTimeLogAggregates,
  getDailyAverage,
  getMajorSymptoms,
} from "../services/insightsService"
import { DailyAverage, PieChartData, MajorSymptomsData } from "../types/insightsTypes"
import {
  INSIGHTS_TITLE,
  INSIGHTS_LOCKED_TITLE,
  INSIGHTS_LOCKED_DESCRIPTION,
  PROGRESS_LABEL,
  PROGRESS_DAYS_FOOTER,
  COMPARE_DAYS_TITLE,
  SYMPTOM_COMPARISON_SUBTITLE,
  DATE_PRESETS
} from "../constants/insightsConstants"

import TopPieChart from "./TopPieChart"
import ComparisonCards from "./ComparisonCards"
import BreakdownTable from "./BreakdownTable"
import MajorSymptomsCard from "./MajorSymptomsCard"
import InsightsCard from "@/components/shared/InsightsCard"
import ExportMenu from "@/features/export/components/ExportMenu"

export default function InsightsDashboard() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlPatientId = searchParams?.get("patientId")

  // If carer clicks a patient, use urlPatientId. Otherwise fallback to user.profileId (for patients)
  const patientId = urlPatientId || user?.profileId || null

  const [loading, setLoading] = useState(true)
  const [eligible, setEligible] = useState<boolean>(true)
  const [hasOneMonthData, setHasOneMonthData] = useState<boolean>(false)
  const [daysTracked, setDaysTracked] = useState(0)
  const [joinedAt, setJoinedAt] = useState<Date>(new Date())

  const [allTimeData, setAllTimeData] = useState<PieChartData>([])
  const [majorSymptomsData, setMajorSymptomsData] = useState<MajorSymptomsData>({ topSymptoms: [], alerts: [] })
  const [fetchingComparison, setFetchingComparison] = useState(false)

  const [dateA, setDateA] = useState<Date>(subDays(startOfToday(), 1))
  const [dateB, setDateB] = useState<Date>(startOfToday())
  const [dataA, setDataA] = useState<DailyAverage | null>(null)
  const [dataB, setDataB] = useState<DailyAverage | null>(null)

  const [selectedPreset, setSelectedPreset] = useState<'1' | '7' | '14'>('1')

  // Fetch initial eligibility and pie chart
  useEffect(() => {
    if (!patientId) return;

    async function init() {
      try {
        const { eligible: isEligible, hasOneMonthData: hasMonth, days, joinedAt: joined } = await getInsightsEligibility(patientId as string)
        setEligible(isEligible)
        setHasOneMonthData(hasMonth)
        setDaysTracked(days)
        if (joined) {
          const joinedDate = new Date(joined)
          setJoinedAt(joinedDate)
          // Ensure default dates aren't before joined date
          if (dateA < joinedDate) setDateA(joinedDate)
          if (dateB < joinedDate) setDateB(joinedDate)
        }

        if (isEligible) {
          const [agg, major] = await Promise.all([
            getAllTimeLogAggregates(patientId as string),
            getMajorSymptoms(patientId as string)
          ])
          setAllTimeData(agg)
          setMajorSymptomsData(major)
        }
      } catch (err) {
        console.error("Initialization error:", err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [patientId])

  // Fetch comparison data when dates change
  useEffect(() => {
    if (!patientId || !eligible) return;

    async function fetchComparison() {
      setFetchingComparison(true)
      try {
        const [resA, resB] = await Promise.all([
          getDailyAverage(patientId as string, dateA),
          getDailyAverage(patientId as string, dateB)
        ])
        setDataA(resA)
        setDataB(resB)
      } finally {
        setFetchingComparison(false)
      }
    }
    fetchComparison()
  }, [patientId, eligible, dateA, dateB])

  return (
    <MobilePageLayout
      title={INSIGHTS_TITLE}
      icon={Activity}
      onBack={urlPatientId ? () => router.push("/insights") : undefined}
      iconContainerClass="bg-gradient-to-br from-primary to-[#0A4B75] shadow-lg shadow-primary/20"
      iconColorClass="text-white"
      headerBottom={eligible ? <ExportMenu patientId={patientId as string} dateA={dateA} dateB={dateB} hasOneMonthData={hasOneMonthData} /> : null}
    >
      {loading ? (
        <div className="flex w-full items-center justify-center p-32"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
      ) : !eligible ? (
        <div className="flex flex-col items-center justify-center w-full min-h-[65vh] text-center p-8 bg-white/80 backdrop-blur-md rounded-[3rem] shadow-2xl mt-6 border border-white/20 animate-in zoom-in-95 duration-500">
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
              <span className="text-sm font-black text-primary">{daysTracked} / 7 days</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-50 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-primary to-[#0A4B75] rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${Math.min((daysTracked / 7) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[11px] font-black text-slate-300 italic">
              {PROGRESS_DAYS_FOOTER(7 - daysTracked)}
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-8 animate-in fade-in duration-500">
          
          <MajorSymptomsCard 
            alerts={majorSymptomsData.alerts} 
          />

          <TopPieChart data={allTimeData} />

          {/* Comparison + Breakdown unified card */}
          <InsightsCard
            title={COMPARE_DAYS_TITLE}
            subtitle={SYMPTOM_COMPARISON_SUBTITLE}
            subtitleClassName="text-[#C46747] font-bold"
          >

            {/* Quick-select buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              {(
                DATE_PRESETS.map(({ label, key }) => {
                  const onClick = () => {
                    if (key === '1') { setDateA(subDays(startOfToday(), 1)); setDateB(startOfToday()); }
                    else if (key === '7') { setDateA(subDays(startOfToday(), 7)); setDateB(startOfToday()); }
                    else if (key === '14') { setDateA(subDays(startOfToday(), 14)); setDateB(startOfToday()); }
                    setSelectedPreset(key);
                  };
                  return (
                    <button
                      key={key}
                      onClick={onClick}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${selectedPreset === key
                          ? 'bg-primary text-primary-foreground shadow-md scale-[1.04]'
                          : 'border-2 border-primary/30 bg-white/60 backdrop-blur-sm text-foreground hover:bg-primary/10 hover:border-primary'
                        }`}
                    >
                      {label}
                    </button>
                  )
                })
              )}
            </div>

            <ComparisonCards
              dateA={dateA}
              dateB={dateB}
              joinedAt={joinedAt}
              onChangeDateA={setDateA}
              onChangeDateB={setDateB}
              dataA={dataA}
              dataB={dataB}
              loading={fetchingComparison}
            />

            <BreakdownTable dateA={dateA} dateB={dateB} dataA={dataA} dataB={dataB} />

          </InsightsCard>
        </div>
      )}
    </MobilePageLayout>
  )
}
