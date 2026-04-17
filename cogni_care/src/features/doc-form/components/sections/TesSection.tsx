import { SectionTag } from "@/components/shared/SectionTag";
import { Pill } from "@/components/shared/Pill";
import { AiBadge } from "@/components/shared/AiBadge";
import { TesSectionProps } from "../../types/docForm";
import { RHI_CRITERIA, CORE_FEATURES, SUPPORTIVE_FEATURES, DIAGNOSTIC_SUBTYPES, CLINICAL_COURSES, CTE_LIKELIHOODS, MOTOR_FEATURES } from "../../constants/docFormConfig";
import { DOC_FORM_STRINGS } from "../../constants/docStrings";
import { CheckRow, InputField } from "./FormPrimitives";

export const TesSection: React.FC<TesSectionProps> = ({ tes, updateTes, aiFilledKeys, showErrors }) => (
  <div className="space-y-4">
    <div className="px-2 pb-8 mb-8 border-b border-slate-100">
      <div className="text-[14px] font-black tracking-tight text-slate-800 flex items-center mb-6"><SectionTag label="A1" /> {DOC_FORM_STRINGS.TES.SECTION_RHI} <span className="text-[10px] text-slate-400 ml-2 font-bold tracking-widest uppercase">{DOC_FORM_STRINGS.TES.RHI_SUBTITLE}</span></div>
      {RHI_CRITERIA.map(c => (
        <CheckRow key={c.key} fieldKey={c.key} label={c.label} tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
      ))}
      <div className="mt-4 border-t border-border/50 pt-4">
        <InputField fieldKey="rhi_notes" label={DOC_FORM_STRINGS.TES.RHI_NOTES} placeholder={DOC_FORM_STRINGS.TES.RHI_PLACEHOLDER} tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
      </div>
    </div>

    <div className="px-2 pb-8 mb-8 border-b border-slate-100">
      <div className="text-[14px] font-black tracking-tight text-slate-800 flex items-center mb-6"><SectionTag label="A2" /> {DOC_FORM_STRINGS.TES.SECTION_CORE} <span className="text-[10px] text-slate-400 ml-2 font-bold tracking-widest uppercase">{DOC_FORM_STRINGS.TES.CORE_SUBTITLE}</span></div>
      {CORE_FEATURES.map(c => (
        <CheckRow key={c.key} fieldKey={c.key} label={c.label} tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
      ))}
    </div>

    <div className="px-2 pb-8 mb-8 border-b border-slate-100">
      <div className="text-[14px] font-black tracking-tight text-slate-800 flex items-center mb-6"><SectionTag label="A3" /> {DOC_FORM_STRINGS.TES.SECTION_SUPPORTIVE} <span className="text-[10px] text-slate-400 ml-2 font-bold tracking-widest uppercase">{DOC_FORM_STRINGS.TES.SUPPORTIVE_SUBTITLE}</span></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        {SUPPORTIVE_FEATURES.map(c => (
          <CheckRow key={c.key} fieldKey={c.key} label={c.label} tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
        ))}
      </div>
    </div>

    <div className="px-2 pb-8 mb-8 border-b border-slate-100">
      <div className="text-[14px] font-black tracking-tight text-slate-800 flex items-center mb-6"><SectionTag label="A4" /> {DOC_FORM_STRINGS.TES.SECTION_DURATION} <span className="text-[10px] text-slate-400 ml-2 font-bold tracking-widest uppercase">{DOC_FORM_STRINGS.TES.DURATION_SUBTITLE}</span></div>
      <InputField fieldKey="symptoms_12months" label={DOC_FORM_STRINGS.TES.DURATION_LABEL} placeholder={DOC_FORM_STRINGS.TES.DURATION_PLACEHOLDER} tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
    </div>

    <div className={`px-2 pb-8 mb-8 border-b border-slate-100 transition-all ${showErrors && !tes.subtype && !tes.course ? 'border-2 border-red-400 bg-red-50/20 rounded-2xl p-6' : ''}`}>
      <div className="text-[14px] font-black tracking-tight text-slate-800 flex items-center mb-5">
        <SectionTag label="B" /> {DOC_FORM_STRINGS.DIAGNOSTICS.SECTION_SUBTYPE} <span className="text-[10px] text-slate-400 ml-2 font-bold tracking-widest uppercase">{DOC_FORM_STRINGS.DIAGNOSTICS.SUBTYPE_SUBTITLE}</span>
        {showErrors && !tes.subtype && <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">{DOC_FORM_STRINGS.DIAGNOSTICS.SELECTION_REQUIRED}</span>}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {DIAGNOSTIC_SUBTYPES.map(s => (
          <Pill key={s} label={s} active={tes.subtype === s} showBadge={aiFilledKeys.has("subtype")} onClick={() => updateTes("subtype", tes.subtype === s ? "" : s)} />
        ))}
      </div>
      <div className="mb-4">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">{DOC_FORM_STRINGS.DIAGNOSTICS.MOTOR_FEATURES}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          {MOTOR_FEATURES.map(({ key, label }) => {
            const finalLabel = key === 'motor_dysarthria' ? `${label} (${DOC_FORM_STRINGS.SYMPTOMS.STAYING_SAME.toLowerCase()})` : label;
            return (
              <CheckRow key={key} fieldKey={key} label={finalLabel} tes={tes} updateTes={updateTes} aiFilledKeys={aiFilledKeys} />
            );
          })}
        </div>
      </div>
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center mb-2 mt-2">
        {DOC_FORM_STRINGS.DIAGNOSTICS.CLINICAL_COURSE}
        {showErrors && !tes.course && <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">{DOC_FORM_STRINGS.DIAGNOSTICS.SELECTION_REQUIRED}</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {CLINICAL_COURSES.map(s => (
          <Pill key={s} label={s} active={tes.course === s} showBadge={aiFilledKeys.has("course")} onClick={() => updateTes("course", tes.course === s ? "" : s)} />
        ))}
      </div>
    </div>

  </div>
);
