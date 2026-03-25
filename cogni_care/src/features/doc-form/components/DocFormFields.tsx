import { FormControl } from "@/components/shared/FormControl";
import { AiBadge } from "@/components/shared/AiBadge";
import { SectionTag } from "@/components/shared/SectionTag";
import { Checkbox } from "@/components/shared/Checkbox";
import { Pill } from "@/components/shared/Pill";
import {
  TesData, SymptomCheck, HistoryData,
  SymptomsSectionProps, HistorySectionProps,
  TesSectionProps, ConcernsSectionProps
} from "../types/docForm";
import { PILLAR_META, SYMPTOM_LIST, PILLARS, CONCERN_ITEMS } from "../constants/docFormConfig";

// ── UI Primitives ──

export const CheckRow = ({ fieldKey, label, tes, updateTes, aiFilledKeys }: { fieldKey: keyof TesData; label: string; tes: TesData; updateTes: (k: string, v: any) => void; aiFilledKeys: Set<any> }) => (
  <div className="flex items-start gap-3 mb-2.5">
    <Checkbox checked={!!tes[fieldKey]} checkedColor="#0ea5e9" onChange={() => updateTes(fieldKey as string, !tes[fieldKey])} />
    <span onClick={() => updateTes(fieldKey as string, !tes[fieldKey])} className="text-[13px] flex-1 leading-snug cursor-pointer select-none">
      {label}
      {aiFilledKeys.has(fieldKey) && tes[fieldKey] && <AiBadge />}
    </span>
  </div>
);

export const InputField = ({ fieldKey, placeholder, tes, updateTes, aiFilledKeys, label, showErrors }: { fieldKey: keyof TesData; placeholder: string; tes: TesData; updateTes: (k: string, v: any) => void; aiFilledKeys: Set<any>; label: string; showErrors?: boolean }) => {
  const isMandatory = fieldKey === 'name' || fieldKey === 'age';
  const isError = (showErrors || isMandatory) && !tes[fieldKey];
  return (
    <FormControl
      containerClass="space-y-1.5"
      labelClass="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1"
      text={label}
      name={fieldKey as string}
      placeholder={placeholder}
      value={tes[fieldKey] as string || ""}
      onChangeHandler={(e) => updateTes(fieldKey as string, e.target.value)}
      inputClass={`w-full p-2.5 px-3.5 rounded-lg border-2 bg-background hover:bg-muted/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-[13px] shadow-sm ${isError ? 'border-red-500/40 bg-red-50/10' : 'border-border/60'}`}
      suffix={aiFilledKeys.has(fieldKey) && tes[fieldKey] ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2"><AiBadge /></span>
      ) : null}
    />
  );
};

// ── Section Components ──

export const SymptomsSection: React.FC<SymptomsSectionProps> = ({
  tes, updateTes, aiFilledKeys, symptomChecks, toggleSymptomPresent, setSymptomChecks, expandedSymptom, setExpandedSymptom, showErrors
}) => (
  <div className="space-y-4">
    <div className="px-2 pb-8 mb-8 border-b border-slate-100">
      <h2 className="text-base font-black flex items-center gap-2 mb-6 tracking-tight text-slate-800">🧑⚕️ Patient Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><InputField fieldKey="name" label="Patient Name" placeholder="Full name" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} showErrors={showErrors} /></div>
        <div><InputField fieldKey="age" label="Age" placeholder="Years" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} showErrors={showErrors} /></div>
        <div><InputField fieldKey="consultant" label="Consultant" placeholder="Dr. Name" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} showErrors={showErrors} /></div>
        <div><InputField fieldKey="evalDate" label="Date of Evaluation" placeholder="DD/MM/YYYY" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} showErrors={showErrors} /></div>
      </div>
    </div>

    <div className="px-2 mb-6">
      <h2 className="text-base font-black flex items-center gap-2 mb-2 mt-4 tracking-tight text-slate-800">✅ Symptom Checklist</h2>
      <p className="text-xs text-muted-foreground mb-4 md:mb-6">Tap a symptom to mark it present, then set duration and trend.</p>
      {PILLARS.map(pillar => {
        const meta = PILLAR_META[pillar];
        const items = SYMPTOM_LIST.filter(s => s.pillar === pillar);
        const activeCount = items.filter(s => symptomChecks[s.key]?.present).length;

        return (
          <div key={pillar} className="mb-12 last:mb-0">
            {/* High-Fidelity Pillar Header (Colored Text & Icon) */}
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: meta.color }} />
              <h3 className="text-[17px] font-bold uppercase tracking-[0.2em]" style={{ color: meta.color }}>
                {meta.label}
              </h3>
              <div
                className="ml-auto px-3 py-1 rounded-full text-[12px] font-bold shadow-sm"
                style={{ backgroundColor: meta.bg, color: meta.color }}
              >
                {activeCount} marked
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {items.map(s => {
                const check = symptomChecks[s.key];
                const checked = check?.present;
                const isIncomplete = showErrors && checked && (
                  !(check.recent || check.sixMonths) ||
                  !(check.improving || check.same || check.worse)
                );
                const showDetails = !!checked;

                return (
                  <div
                    key={s.key}
                    className={`rounded-xl transition-all duration-500 border-2 ${checked ? 'shadow-xl' : 'shadow-sm'} ${isIncomplete ? 'border-red-400 bg-red-50/30' : ''}`}
                    style={{
                        backgroundColor: checked ? (isIncomplete ? '#fef2f2' : meta.bg) : '#ffffff',
                        borderColor: isIncomplete ? '#f87171' : (checked ? meta.color : '#e5e7eb')
                    }}
                  >
                    {/* Header Row */}
                    <div
                      className={`flex items-center px-6 py-4 cursor-pointer ${showDetails ? 'rounded-t-xl' : 'rounded-xl'}`}
                      onClick={() => toggleSymptomPresent(s.key)}
                    >
                      <div className="mr-4">
                        <Checkbox checked={!!checked} checkedColor={isIncomplete ? '#ef4444' : meta.color} />
                      </div>
                      <span className={`text-[17px] flex-1 font-serif ${checked ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                        {s.label}
                        {isIncomplete && <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">Incomplete selection</span>}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        {aiFilledKeys.has(`symptom_${s.key}`) && checked && <AiBadge />}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 transition-transform duration-300" style={checked ? { transform: 'rotate(180deg)', color: meta.color } : {}}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Options */}
                    {showDetails && (
                      <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-500">
                        <div className="space-y-8 pt-4 px-1">
                          <div>
                            <p className="text-[10px] font-black text-slate-700 tracking-[0.15em] uppercase mb-4 px-1">Duration</p>
                            <div className="flex gap-2">
                              <Pill 
                                label="Recent (<6 mo)" 
                                active={!!symptomChecks[s.key]?.recent} 
                                activeColor={meta.color}
                                onClick={() => setSymptomChecks(p => ({ ...p, [s.key]: { ...p[s.key], recent: true, sixMonths: false, duration: "recent" } }))} 
                              />
                              <Pill 
                                label="6 Months+" 
                                active={!!symptomChecks[s.key]?.sixMonths} 
                                activeColor={meta.color}
                                onClick={() => setSymptomChecks(p => ({ ...p, [s.key]: { ...p[s.key], recent: false, sixMonths: true, duration: "6months+" } }))} 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-[10px] font-black text-slate-700 tracking-[0.15em] uppercase mb-4 px-1">Clinical Trend</p>
                            <div className="flex flex-wrap gap-2">
                              <Pill 
                                label="Improving" 
                                active={!!symptomChecks[s.key]?.improving} 
                                activeColor={meta.color}
                                onClick={() => setSymptomChecks(p => ({ ...p, [s.key]: { ...p[s.key], improving: true, same: false, worse: false, trend: "improving" } }))} 
                              />
                              <Pill 
                                label="Same" 
                                active={!!symptomChecks[s.key]?.same} 
                                activeColor={meta.color}
                                onClick={() => setSymptomChecks(p => ({ ...p, [s.key]: { ...p[s.key], improving: false, same: true, worse: false, trend: "staying_same" } }))} 
                              />
                              <Pill 
                                label="Worsening" 
                                active={!!symptomChecks[s.key]?.worse} 
                                activeColor={meta.color}
                                onClick={() => setSymptomChecks(p => ({ ...p, [s.key]: { ...p[s.key], improving: false, same: false, worse: true, trend: "getting_worse" } }))} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);



export const HistorySection: React.FC<HistorySectionProps> = ({ history, updateHistory, showErrors }) => (
  <div className="space-y-4">
    {([
      ["stoppedChores", "Have you stopped chores/activities you used to do due to memory or thinking?"],
      ["drinking", "Have you ever had drinking problems?"],
      ["nonPrescription", "Are you taking any non prescription drugs?"],
      ["diet", "What is your diet like?"],
      ["familyHistory", "Is there family history of dementia or other neurological diseases (Alzheimer's, ALS, Parkinson's disease)?"],
      ["supportNetwork", "What is your support network like?"],
      ["additionalNotes", "Additional notes (Optional)"],
    ] as [keyof HistoryData, string][]).map(([key, question]) => {
      const isError = showErrors && key !== 'additionalNotes' && !history[key]?.trim();
      return (
        <div key={key} className={`rounded-2xl border-2 p-6 transition-all ${isError ? 'border-red-400 bg-red-50/20' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
          <label className="text-[13px] font-bold mb-3 flex items-center">
            {question}
            {isError && <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">Response Required</span>}
          </label>
          <textarea
            className={`w-full min-h-[80px] p-3 rounded-xl border-2 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm resize-y transition-all ${isError ? 'border-red-300 bg-red-50/10' : 'border-border/60'}`}
            value={history[key]}
            onChange={(e) => updateHistory(key, e.target.value)}
            placeholder="Enter response here…"
          />
        </div>
      );
    })}
  </div>
);



export const TesSection: React.FC<TesSectionProps> = ({ tes, updateTes, aiFilledKeys, showErrors }) => (
  <div className="space-y-4">
    <div className="px-2 pb-8 mb-8 border-b border-slate-100">
      <div className="text-[14px] font-black tracking-tight text-slate-800 flex items-center mb-6"><SectionTag label="A1" /> History of Repetitive Head Impacts <span className="text-[10px] text-slate-400 ml-2 font-bold tracking-widest uppercase">≥1 must be met</span></div>
      <CheckRow fieldKey="rhi_concussions4" label="At least 4 concussions or mild TBIs" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
      <CheckRow fieldKey="rhi_moderate2" label="At least 2 moderate/severe TBIs" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
      <CheckRow fieldKey="rhi_sports6" label="At least 6 years of organised contact sports" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
      <CheckRow fieldKey="rhi_military" label="Military service with combat exposure" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
      <CheckRow fieldKey="rhi_other" label="Other significant RHI (e.g. domestic violence)" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
      <div className="mt-4 border-t border-border/50 pt-4">
        <InputField fieldKey="rhi_notes" label="RHI Notes" placeholder="e.g. 9 years contact sports, 3 recorded concussions" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
      </div>
    </div>

    <div className="px-2 pb-8 mb-8 border-b border-slate-100">
      <div className="text-[14px] font-black tracking-tight text-slate-800 flex items-center mb-6"><SectionTag label="A2" /> Core Clinical Features <span className="text-[10px] text-slate-400 ml-2 font-bold tracking-widest uppercase">≥1 must be present</span></div>
      <CheckRow fieldKey="core_cognitive" label="Cognitive — significant impairment in memory, orientation, attention, executive function or visuospatial" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
      <CheckRow fieldKey="core_behavioral" label="Behavioral — explosive, short fuse, physically/verbally violent or intermittent explosive disorder" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
      <CheckRow fieldKey="core_mood" label="Mood — feeling overly sad, depressed or hopeless; or diagnosis of MDD or Persistent Depressive Disorder" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
    </div>

    <div className="px-2 pb-8 mb-8 border-b border-slate-100">
      <div className="text-[14px] font-black tracking-tight text-slate-800 flex items-center mb-6"><SectionTag label="A3" /> Supportive Features <span className="text-[10px] text-slate-400 ml-2 font-bold tracking-widest uppercase">≥2 must be present</span></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        <CheckRow fieldKey="sup_decline" label="Documented decline (≥1 year)" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
        <CheckRow fieldKey="sup_delayed" label="Delayed symptom onset after exposure" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
        <CheckRow fieldKey="sup_impulsivity" label="Impulsivity" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
        <CheckRow fieldKey="sup_anxiety" label="Anxiety" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
        <CheckRow fieldKey="sup_apathy" label="Apathy" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
        <CheckRow fieldKey="sup_paranoia" label="Paranoia" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
        <CheckRow fieldKey="sup_suicidality" label="Suicidality" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
        <CheckRow fieldKey="sup_headache" label="Headache" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
        <CheckRow fieldKey="sup_motor" label="Motor impairment" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
      </div>
    </div>

    <div className="px-2 pb-8 mb-8 border-b border-slate-100">
      <div className="text-[14px] font-black tracking-tight text-slate-800 flex items-center mb-6"><SectionTag label="A4" /> Duration of Clinical Features <span className="text-[10px] text-slate-400 ml-2 font-bold tracking-widest uppercase">Minimum 12 months</span></div>
      <InputField fieldKey="symptoms_12months" label="Duration Summary" placeholder="Describe duration of symptoms" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
    </div>

    <div className={`px-2 pb-8 mb-8 border-b border-slate-100 transition-all ${showErrors && !tes.subtype && !tes.course ? 'border-2 border-red-400 bg-red-50/20 rounded-2xl p-6' : ''}`}>
      <div className="text-[14px] font-black tracking-tight text-slate-800 flex items-center mb-5">
        <SectionTag label="B" /> Diagnostic Subtype <span className="text-[10px] text-slate-400 ml-2 font-bold tracking-widest uppercase">Select 1</span>
        {showErrors && !tes.subtype && <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">Selection Required</span>}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {["Cognitive", "Behavioral/Mood", "Mixed", "Dementia"].map(s => (
          <Pill key={s} label={s} active={tes.subtype === s} showBadge={aiFilledKeys.has("subtype")} onClick={() => updateTes("subtype", tes.subtype === s ? "" : s)} />
        ))}
      </div>
      <div className="mb-4">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Motor Features (≥1)</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          <CheckRow fieldKey="motor_dysarthria" label="Dysarthria (slurred speech)" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
          <CheckRow fieldKey="motor_dysgraphia" label="Dysgraphia" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
          <CheckRow fieldKey="motor_brady" label="Bradykinesia" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
          <CheckRow fieldKey="motor_tremor" label="Tremor" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
          <CheckRow fieldKey="motor_rigidity" label="Rigidity" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
          <CheckRow fieldKey="motor_gait" label="Gait change" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
          <CheckRow fieldKey="motor_falls" label="Falls / parkinsonism" tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
        </div>
      </div>
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center mb-2 mt-2">
        Clinical Course
        {showErrors && !tes.course && <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">Selection Required</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {["Stable", "Progressive", "Unknown/Inconsistent"].map(s => (
          <Pill key={s} label={s} active={tes.course === s} showBadge={aiFilledKeys.has("course")} onClick={() => updateTes("course", tes.course === s ? "" : s)} />
        ))}
      </div>
    </div>

    <div className={`px-2 pb-8 transition-all mb-6 ${showErrors && !tes.cte_likelihood ? 'border-2 border-red-400 bg-red-50/20 rounded-2xl p-6' : ''}`}>
      <div className="text-[14px] font-black tracking-tight text-slate-800 flex items-center mb-5">
        <span className="bg-red-500/80 text-white rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide mr-2">C</span>
        CTE Likelihood <span className="text-[10px] text-slate-400 ml-2 font-bold tracking-widest uppercase">Select 1</span>
        {showErrors && !tes.cte_likelihood && <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">Selection Required</span>}
      </div>
      <div className="bg-white/95 backdrop-blur-xl border-l-[4px] border-l-amber-500 border border-amber-100 rounded-xl p-3 shadow-sm text-xs text-amber-700 font-medium flex items-start gap-2 mb-4">
        <span className="text-sm leading-none mt-[2px]">ℹ️</span>
        <span>Requires imaging and biomarker results — cannot be inferred from symptom logs. Leave blank until clinical data is available.</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {["Probable CTE", "Possible CTE", "Unlikely CTE"].map(s => (
          <button
            key={s} onClick={() => updateTes("cte_likelihood", tes.cte_likelihood === s ? "" : s)}
            className={`px-4 py-2 rounded-xl text-xs transition-all border-2 ${tes.cte_likelihood === s ? 'border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9] font-black shadow-md' : 'border-slate-100 bg-slate-50/50 text-muted-foreground/60 font-bold hover:border-[#0ea5e9]/30'}`}
          >
            {s}
            {aiFilledKeys.has("cte_likelihood") && tes.cte_likelihood === s && <AiBadge />}
          </button>
        ))}
      </div>
    </div>
  </div>
);



export const ConcernsSection: React.FC<ConcernsSectionProps> = ({ concerns, toggleConcern, showErrors }) => (
  <div className="space-y-4 py-4">
    <div className="px-2">
      <h2 className="text-base font-black flex items-center gap-2 mb-1 tracking-tight text-slate-800">🏥 Environment & Care Suggestions</h2>
      <p className="text-[13px] font-bold text-slate-400 mb-8 font-sans">Select accommodations to be included in the PDF report.</p>
      <div className="space-y-4">
        {CONCERN_ITEMS.map((item, i) => (
          <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${concerns[i] ? 'border-[#0ea5e9] bg-[#0ea5e9]/5 shadow-sm' : 'border-slate-50 bg-slate-50/50 hover:border-slate-100'}`} onClick={() => toggleConcern(i)}>
            <Checkbox checked={!!concerns[i]} checkedColor="#0ea5e9" onChange={() => { }} />
            <span className={`text-[14px] leading-relaxed flex-1 ${concerns[i] ? 'text-foreground font-black' : 'text-slate-500 font-bold'}`}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
