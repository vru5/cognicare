import { HistorySectionProps } from "../../types/docForm";
import { HISTORY_FIELDS } from "../../constants/docFormConfig";
import { DOC_FORM_STRINGS } from "../../constants/docStrings";

export const HistorySection: React.FC<HistorySectionProps> = ({ history, updateHistory, showErrors }) => (
  <div className="space-y-4">
    {HISTORY_FIELDS.map(({ key, label: question }) => {
      const isError = showErrors && key !== 'additionalNotes' && !history[key]?.trim();
      return (
        <div key={key} className={`rounded-2xl border-2 p-6 transition-all ${isError ? 'border-red-400 bg-red-50/20' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
          <label className="text-[13px] font-bold mb-3 flex items-center">
            {question}
            {isError && <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">{DOC_FORM_STRINGS.HISTORY.RESPONSE_REQUIRED}</span>}
          </label>
          <textarea
            className={`w-full min-h-[80px] p-3 rounded-xl border-2 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm resize-y transition-all ${isError ? 'border-red-300 bg-red-50/10' : 'border-border/60'}`}
            value={history[key]}
            onChange={(e) => updateHistory(key, e.target.value)}
            placeholder={DOC_FORM_STRINGS.HISTORY.PLACEHOLDER}
          />
        </div>
      );
    })}
  </div>
);
