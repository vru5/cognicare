import { FormControl } from "@/components/shared/FormControl";
import { AiBadge } from "@/components/shared/AiBadge";
import { Checkbox } from "@/components/shared/Checkbox";
import { TesData } from "../../types/docForm";

export const CheckRow = ({ fieldKey, label, tes, updateTes, aiFilledKeys }: { fieldKey: keyof TesData; label: string; tes: TesData; updateTes: (k: string, v: string | boolean) => void; aiFilledKeys: Set<string> }) => (
  <div className="flex items-start gap-3 mb-2.5">
    <Checkbox checked={!!tes[fieldKey]} checkedColor="#0ea5e9" onChange={() => updateTes(fieldKey as string, !tes[fieldKey])} />
    <span onClick={() => updateTes(fieldKey as string, !tes[fieldKey])} className="text-[13px] flex-1 leading-snug cursor-pointer select-none">
      {label}
      {aiFilledKeys.has(fieldKey as string) && tes[fieldKey] && <AiBadge />}
    </span>
  </div>
);

export const InputField = ({ fieldKey, placeholder, tes, updateTes, aiFilledKeys, label, showErrors }: { fieldKey: keyof TesData; placeholder: string; tes: TesData; updateTes: (k: string, v: string | boolean) => void; aiFilledKeys: Set<string>; label: string; showErrors?: boolean }) => {
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
