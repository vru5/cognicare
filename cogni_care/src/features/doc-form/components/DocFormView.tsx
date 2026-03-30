"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import MobilePageLayout from "@/components/shared/MobilePageLayout";
import { getDoctorFormData, updateDoctorFormData, gradeHistoryRisk } from "@/features/export/services/exportService";
import { generatePdfFromElement } from "@/features/export/services/pdfService";
import DocFormPDF from "./DocFormPDF";
import { SeverityMeter } from "./SeverityMeter";
import {
  SymptomsSection,
  HistorySection,
  TesSection,
  ConcernsSection
} from "./DocFormFields";
import { AiBadge } from "@/components/shared/AiBadge";
import {
  SECTIONS,
  DEFAULT_TES,
  DEFAULT_HISTORY
} from "../constants/docFormConfig";
import { DOC_FORM_STRINGS } from "../constants/docStrings";
import {
  TesData,
  SymptomCheck,
  HistoryData,
  PatientDetails
} from "../types/docForm";

export default function DocFormView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get("patientId");

  const [activeSection, setActiveSection] = useState("symptoms");
  const [prefillStatus, setPrefillStatus] = useState("loading");
  const [prefillMsg, setPrefillMsg] = useState(DOC_FORM_STRINGS.PREFILL.LOADING_MSG_INITIAL);
  const [aiFilledKeys, setAiFilledKeys] = useState(new Set<string>());
  const [tes, setTes] = useState<TesData>(DEFAULT_TES);
  const [symptomChecks, setSymptomChecks] = useState<Record<string, SymptomCheck>>({});
  const [expandedSymptom, setExpandedSymptom] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryData>(DEFAULT_HISTORY);
  const [concerns, setConcerns] = useState<Record<number, boolean>>({});
  const [patientData, setPatientData] = useState<PatientDetails | null>(null);
  const [aiHistoryGrade, setAiHistoryGrade] = useState<number | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!patientId) {
      setPrefillStatus("error");
      setPrefillMsg(DOC_FORM_STRINGS.PREFILL.ERROR_MISSING_ID);
      return;
    }

    const run = async () => {
      try {
        setPrefillStatus("loading");
        setPrefillMsg(DOC_FORM_STRINGS.PREFILL.LOADING_MSG_TES);

        const data = await getDoctorFormData(patientId);
        if (!data) throw new Error("AI pre-fill failed or no data found");

        setPatientData(data.patientDetails);

        const filled = new Set<string>();
        Object.entries(data.tes || {}).forEach(([k, v]) => {
          if (v !== "" && v !== false && v !== null) filled.add(k);
        });

        setTes(prev => ({
          ...prev,
          ...(data.tes as typeof prev),
          name: data.tes?.name || data.patientDetails?.name || prev.name,
          age: String(data.tes?.age || data.patientDetails?.age || prev.age),
          consultant: data.tes?.consultant || data.patientDetails?.consultant || prev.consultant,
          evalDate: data.tes?.evalDate || data.patientDetails?.evaluationDate || prev.evalDate
        }));

        const checks: Record<string, SymptomCheck> = {};
        Object.entries(data.symptomChecks || {}).forEach(([sym, val]: [string, any]) => {
          if (val && val.present) {
            // Robust check: use string fields if they exist, otherwise fallback to boolean flags
            const duration = val.duration || (val.recent ? "recent" : val.sixMonths ? "6months+" : "");
            const trend = val.trend || (val.improving ? "improving" : val.same ? "staying_same" : val.worse ? "getting_worse" : "");

            checks[sym] = {
              present: true,
              duration,
              trend,
              recent: duration === "recent",
              sixMonths: duration === "6months+",
              improving: trend === "improving",
              same: trend === "staying_same",
              worse: trend === "getting_worse"
            };
            filled.add(`symptom_${sym}`);
          }
        });

        setSymptomChecks(checks);
        setAiFilledKeys(filled);
        setPrefillStatus("done");
      } catch (err) {
        console.error("[DocForm] Prefill processing failed:", err);
        setPrefillStatus("error");
        setPrefillMsg(DOC_FORM_STRINGS.PREFILL.ERROR_FAILED);
      }
    };
    run();
  }, [patientId]);

  const updateTes = (k: string, v: string | boolean) => {
    setAiFilledKeys((p) => { const n = new Set(p); n.delete(k); return n; });
    setTes(p => ({ ...p, [k]: v }));
  };
  const updateHistory = (k: keyof HistoryData, v: string) => setHistory(p => ({ ...p, [k]: v }));
  const toggleConcern = (k: number) => setConcerns((p) => ({ ...p, [k]: !p[k] }));

  const toggleSymptomPresent = (sym: string) => {
    setAiFilledKeys((p) => { const n = new Set(p); n.delete(`symptom_${sym}`); return n; });
    setSymptomChecks((p) => {
      if (p[sym]?.present) { const n = { ...p }; delete n[sym]; return n; }
      return { ...p, [sym]: { present: true } };
    });
  };

  const curIdx = SECTIONS.findIndex(s => s.id === activeSection);

  const isCurrentSectionValid = useMemo(() => {
    if (activeSection === "symptoms") {
      const presentSymptoms = Object.values(symptomChecks).filter((s) => s.present);
      const hasSymptom = presentSymptoms.length > 0;
      const allComplete = presentSymptoms.every((s) => (s.recent || s.sixMonths) && (s.improving || s.same || s.worse));
      const hasBasicInfo = !!(tes.name?.trim() && tes.age?.trim());
      return hasSymptom && allComplete && hasBasicInfo;
    }
    if (activeSection === "history") {
      return !!(history.stoppedChores?.trim() && history.drinking?.trim() && history.nonPrescription?.trim() && history.diet?.trim() && history.familyHistory?.trim() && history.supportNetwork?.trim());
    }
    if (activeSection === "tes") {
      const rhiMet = ['rhi_concussions4', 'rhi_moderate2', 'rhi_sports6', 'rhi_military', 'rhi_other'].some(k => tes[k as keyof typeof tes]);
      const a2Met = ['core_cognitive', 'core_behavioral', 'core_mood'].some(k => tes[k as keyof typeof tes]);
      const a3Met = ['sup_decline', 'sup_delayed', 'sup_impulsivity', 'sup_anxiety', 'sup_apathy', 'sup_paranoia', 'sup_suicidality', 'sup_headache', 'sup_motor'].filter(k => tes[k as keyof typeof tes]).length >= 2;
      return rhiMet && a2Met && a3Met && !!tes.subtype && !!tes.course && !!tes.cte_likelihood;
    }
    return true;
  }, [activeSection, symptomChecks, tes, history]);

  const handleExport = async () => {
    if (isExporting || !pdfRef.current || !patientId) return;
    setIsExporting(true);
    try {
      await updateDoctorFormData(patientId, { tes, symptomChecks, patientDetails: patientData as PatientDetails });
      const success = await generatePdfFromElement(pdfRef.current, `CTE-Doctor-Form-${patientData?.name || "Patient"}-${Date.now()}.pdf`, () => { });
      if (success) {
        // No explicit alert as generatePdfFromElement now handles "opening" the file
        // but we can set a short success state if needed.
      }
    } catch (e) {
      console.error("PDF export failed", e);
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <MobilePageLayout
        title="Doc-Form"
        subtitle={`Patient: ${patientData?.name || "N/A"} · Eval: ${patientData?.evaluationDate || "N/A"}`}
        icon={Activity}
        onBack={() => router.back()}
        iconContainerClass="bg-gradient-to-br from-primary to-[#0A4B75] shadow-lg shadow-primary/20"
        iconColorClass="text-white"
      >
        <div className="flex-1 relative min-h-[60vh] flex flex-col w-full">
          {prefillStatus === "loading" ? (
            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 px-4">
              <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-2xl shadow-xl flex flex-col items-center gap-5 text-center max-w-sm w-full mx-auto">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                  <span className="animate-pulse text-3xl text-primary drop-shadow-sm">✦</span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-[#0B4063] tracking-tight">{DOC_FORM_STRINGS.PREFILL.LOADING_TITLE}</h3>
                  <p className="text-sm font-bold text-primary/70">{prefillMsg}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 animate-in slide-in-from-bottom-4 duration-500 w-full">
              <div className="w-full relative z-10 px-4 md:px-6 mb-2">
                {prefillStatus === "error" && (
                  <div className="bg-white/90 backdrop-blur-xl border-l-4 border-l-red-500 border border-red-100 rounded-2xl p-4 shadow-sm text-sm text-red-700 font-medium flex items-center gap-3">
                    <span className="text-xl">⚠</span><span>{prefillMsg}</span>
                  </div>
                )}
                {prefillStatus === "done" && (
                  <div className="bg-white/95 backdrop-blur-xl border-l-4 border-l-green-500 border border-green-100/50 rounded-2xl p-4 shadow-sm flex items-center gap-3 text-sm text-green-700">
                    <span className="font-bold text-green-600 bg-green-100 w-6 h-6 rounded-full flex items-center justify-center shrink-0">✓</span>
                    <span><b>{DOC_FORM_STRINGS.PREFILL.SUCCESS_BOLD}</b> {DOC_FORM_STRINGS.PREFILL.SUCCESS_TEXT} <span className="inline-block translate-y-[-1px]"><AiBadge /></span> {DOC_FORM_STRINGS.PREFILL.SUCCESS_SUFFIX}</span>
                  </div>
                )}
              </div>

              <div className="p-2 md:p-6 min-h-[50vh] w-full">
                <div className="pb-24 w-full">
                  <div className="flex-1 flex flex-col min-h-0 bg-white border-slate-200 rounded-2xl border shadow-2xl overflow-hidden mx-0 my-2 transition-all w-full">
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                      {activeSection === "symptoms" && <SymptomsSection tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} symptomChecks={symptomChecks} toggleSymptomPresent={toggleSymptomPresent} setSymptomChecks={setSymptomChecks} expandedSymptom={expandedSymptom} setExpandedSymptom={setExpandedSymptom} showErrors={showErrors} />}
                      {activeSection === "history" && <HistorySection history={history} updateHistory={updateHistory} showErrors={showErrors} />}
                      {activeSection === "tes" && <TesSection tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} showErrors={showErrors} />}
                      {activeSection === "concerns" && <ConcernsSection concerns={concerns} toggleConcern={toggleConcern} showErrors={showErrors} />}

                      {activeSection === "summary" && (
                        <div className="space-y-6">
                          <SeverityMeter tes={tes} symptomChecks={symptomChecks} history={history} aiHistoryGrade={aiHistoryGrade} />
                          <div className="bg-sky-50/50 text-card-foreground rounded-2xl border border-sky-100 p-6 shadow-sm">
                            <div className="text-[13px] font-black flex items-center mb-3 uppercase tracking-widest text-[#0ea5e9]">{DOC_FORM_STRINGS.SUMMARY.VIEW_TITLE}</div>
                            <p className="text-[13px] leading-relaxed font-bold text-sky-800/70">{DOC_FORM_STRINGS.SUMMARY.VIEW_DESC}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {prefillStatus !== "loading" && (
            <div className="flex justify-between items-center fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-md border-t border-border p-4 md:px-8 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
              <div>
                {curIdx > 0 && (
                  <button onClick={() => { window.scrollTo(0, 0); setActiveSection(SECTIONS[curIdx - 1].id); }} className="px-6 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all active:scale-95">
                    {DOC_FORM_STRINGS.NAVIGATION.BTN_BACK}
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                {curIdx < SECTIONS.length - 1 ? (
                  <button
                    onClick={async () => {
                      setShowErrors(false);
                      const nextSec = SECTIONS[curIdx + 1].id;

                      // Background AI Grading trigger
                      if (nextSec === "concerns" && !isGrading) {
                        setIsGrading(true);
                        gradeHistoryRisk(history).then(res => {
                          if (res?.success) setAiHistoryGrade(res.historyScore);
                          setIsGrading(false);
                        }).catch(() => setIsGrading(false));
                      }

                      window.scrollTo(0, 0);
                      setActiveSection(nextSec);
                    }}
                    disabled={!isCurrentSectionValid}
                    className={`px-10 py-3 rounded-xl shadow-lg font-black text-sm uppercase tracking-widest transition-all ${isCurrentSectionValid ? "bg-[#0ea5e9] text-white hover:opacity-95 active:scale-[0.98] shadow-blue-200" : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200 shadow-none"}`}
                  >
                    {DOC_FORM_STRINGS.NAVIGATION.BTN_NEXT}
                  </button>
                ) : (
                  <button
                    onClick={handleExport}
                    disabled={isExporting || !isCurrentSectionValid}
                    className={`flex items-center gap-2 px-10 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${(isExporting || !isCurrentSectionValid) ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200 shadow-none' : 'bg-[#0ea5e9] text-white shadow-lg hover:opacity-95 active:scale-[0.98] shadow-blue-200'}`}
                  >
                    {isExporting ? DOC_FORM_STRINGS.GENERAL.BTN_GENERATING : DOC_FORM_STRINGS.GENERAL.BTN_DOWNLOAD_PDF}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </MobilePageLayout>

      <div style={{ position: "absolute", top: "-10000px", left: 0, width: "950px" }}>
        {patientData && (
          <div ref={pdfRef} className="bg-white text-black print-mode-wrapper w-[950px] font-serif">
            <DocFormPDF data={{ patient: patientData as PatientDetails, tes, symptoms: symptomChecks, history, concerns, aiHistoryGrade }} />
          </div>
        )}
      </div>
    </>
  );
}
