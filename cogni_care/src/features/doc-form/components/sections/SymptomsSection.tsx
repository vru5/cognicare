import { Pill } from "@/components/shared/Pill";
import { Checkbox } from "@/components/shared/Checkbox";
import { AiBadge } from "@/components/shared/AiBadge";
import { SymptomsSectionProps } from "../../types/docForm";
import { SYMPTOM_DURATIONS, PATIENT_INFO_FIELDS } from "../../constants/docFormConfig";
import { PILLAR_META, SYMPTOM_LIST, PILLARS } from "@/constants/symptoms";
import { DOC_FORM_STRINGS } from "../../constants/docStrings";
import { InputField } from "./FormPrimitives";

export const SymptomsSection: React.FC<SymptomsSectionProps> = ({
  tes, updateTes, aiFilledKeys, symptomChecks, toggleSymptomPresent, setSymptomChecks, expandedSymptom, setExpandedSymptom, showErrors
}) => (
  <div className="space-y-4">
    <div className="px-2 pb-8 mb-8 border-b border-slate-100">
      <h2 className="text-base font-black flex items-center gap-2 mb-6 tracking-tight text-slate-800">{DOC_FORM_STRINGS.PATIENT_INFO.SECTION_TITLE}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PATIENT_INFO_FIELDS.map((field) => (
          <div key={field.key}>
            <InputField 
              fieldKey={field.key} 
              label={field.label} 
              placeholder={field.placeholder} 
              tes={tes} 
              updateTes={updateTes} 
              aiFilledKeys={aiFilledKeys} 
              showErrors={showErrors} 
            />
          </div>
        ))}
      </div>
    </div>

    <div className="px-2 mb-6">
      <h2 className="text-base font-black flex items-center gap-2 mb-2 mt-4 tracking-tight text-slate-800">{DOC_FORM_STRINGS.SYMPTOMS.SECTION_TITLE}</h2>
      <p className="text-xs text-muted-foreground mb-4 md:mb-6">{DOC_FORM_STRINGS.SYMPTOMS.SUBTITLE}</p>
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
                {activeCount} {DOC_FORM_STRINGS.SYMPTOMS.MARKED}
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
                        {isIncomplete && <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">{DOC_FORM_STRINGS.SYMPTOMS.INCOMPLETE}</span>}
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
                             <p className="text-[10px] font-black text-slate-700 tracking-[0.15em] uppercase mb-4 px-1">{DOC_FORM_STRINGS.SYMPTOMS.DURATION}</p>
                            <div className="flex gap-2">
                              <Pill 
                                label={DOC_FORM_STRINGS.SYMPTOMS.RECENT} 
                                active={symptomChecks[s.key]?.duration === SYMPTOM_DURATIONS.RECENT} 
                                activeColor={meta.color}
                                onClick={() => setSymptomChecks(p => ({ ...p, [s.key]: { ...p[s.key], recent: true, sixMonths: false, duration: SYMPTOM_DURATIONS.RECENT } }))} 
                              />
                              <Pill 
                                label={DOC_FORM_STRINGS.SYMPTOMS.SIX_MONTHS_PLUS} 
                                active={symptomChecks[s.key]?.duration === SYMPTOM_DURATIONS.SIX_MONTHS_PLUS} 
                                activeColor={meta.color}
                                onClick={() => setSymptomChecks(p => ({ ...p, [s.key]: { ...p[s.key], recent: false, sixMonths: true, duration: SYMPTOM_DURATIONS.SIX_MONTHS_PLUS } }))} 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-[10px] font-black text-slate-700 tracking-[0.15em] uppercase mb-4 px-1">{DOC_FORM_STRINGS.SYMPTOMS.CLINICAL_TREND}</p>
                            <div className="flex flex-wrap gap-2">
                              <Pill 
                                label={DOC_FORM_STRINGS.SYMPTOMS.IMPROVING} 
                                active={!!symptomChecks[s.key]?.improving} 
                                activeColor={meta.color}
                                onClick={() => setSymptomChecks(p => ({ ...p, [s.key]: { ...p[s.key], improving: true, same: false, worse: false, trend: "improving" } }))} 
                              />
                              <Pill 
                                label={DOC_FORM_STRINGS.SYMPTOMS.SAME} 
                                active={!!symptomChecks[s.key]?.same} 
                                activeColor={meta.color}
                                onClick={() => setSymptomChecks(p => ({ ...p, [s.key]: { ...p[s.key], improving: false, same: true, worse: false, trend: "staying_same" } }))} 
                              />
                              <Pill 
                                label={DOC_FORM_STRINGS.SYMPTOMS.WORSENING} 
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
