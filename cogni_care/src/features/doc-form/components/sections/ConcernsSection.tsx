import { Checkbox } from "@/components/shared/Checkbox";
import { ConcernsSectionProps } from "../../types/docForm";
import { CONCERN_ITEMS } from "../../constants/docFormConfig";
import { DOC_FORM_STRINGS } from "../../constants/docStrings";

export const ConcernsSection: React.FC<ConcernsSectionProps> = ({ concerns, toggleConcern, showErrors }) => (
  <div className="space-y-4 py-4">
    <div className="px-2">
      <h2 className="text-base font-black flex items-center gap-2 mb-1 tracking-tight text-slate-800">{DOC_FORM_STRINGS.CONCERNS.SECTION_TITLE}</h2>
      <p className="text-[13px] font-bold text-slate-400 mb-8 font-sans">{DOC_FORM_STRINGS.CONCERNS.SUBTITLE}</p>
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
