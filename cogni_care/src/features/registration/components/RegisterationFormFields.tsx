import {
  CARER,
  FAMILY_CONTACT,
  PATIENT,
} from "@/constants/registerationPage";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/shared/FormControl";
import { getRegisterationFields } from "../constants/registerationFormConfig";
import { RegisterationFormFieldsProps, RegistrationFieldConfig } from "../types/registerationForm";

export function RegisterationFormFields(props: RegisterationFormFieldsProps) {
  const {
    handleSubmit,
    handleInputChange,
    loading,
    passwordValid,
    passwordsMatch,
    role,
  } = props;

  const { fields, familyFields } = getRegisterationFields(props);

  const inputClass = (field: string) =>
    `w-full p-4 rounded-2xl border bg-white/50 text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300 shadow-sm focus:ring-2 ${props.errorField === field
      ? "border-destructive focus:ring-destructive/20"
      : "border-slate-200 focus:ring-primary focus:border-primary"
    }`;

  const labelClass = (field: string) =>
    `text-sm font-bold ml-1 transition-colors ${props.errorField === field ? "text-destructive" : "text-foreground/60"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field: RegistrationFieldConfig) => {
        if (field.renderIf === false) return null;

        if (field.isRole) {
          return (
            <div key={field.name} className="space-y-3">
              <label className="text-sm font-bold text-foreground/60 ml-1">{field.text}</label>
              <div className="grid grid-cols-2 gap-4">
                {[PATIENT, CARER].map((r) => (
                  <label
                    key={r}
                    className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all cursor-pointer ${role === r.toUpperCase() ? "border-primary bg-primary/10" : "border-slate-100 bg-slate-50/50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      className="sr-only"
                      onChange={() => {
                        const val = r.toUpperCase() as "PATIENT" | "CARER";
                        field.onChange ? field.onChange(val) : props.setRole(val);
                      }}
                      required
                    />
                    <span className={`text-lg font-bold ${role === r.toUpperCase() ? "text-primary" : "text-foreground/40"}`}>{r}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }

        if (field.isFamilySection) {
          return (
            <div key={field.name} className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-500">
              <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-5">
                <h4 className="font-bold text-foreground text-sm tracking-wide">{field.text}</h4>
                {familyFields.map((f: RegistrationFieldConfig) => (
                  <FormControl
                    key={f.name}
                    containerClass="space-y-2"
                    labelClass={labelClass(f.name || "")}
                    text={f.text || ""}
                    name={f.name || ""}
                    placeholder={f.placeholder}
                    inputClass={inputClass(f.name || "")}
                    onChangeHandler={handleInputChange}
                    error={props.errorField === f.name ? props.error : ""}
                  />
                ))}
              </div>
            </div>
          );
        }

        return (
          <FormControl
            key={field.name}
            containerClass={field.containerClass || "space-y-2"}
            labelClass={labelClass(field.name || "")}
            text={field.text || ""}
            name={field.name || ""}
            type={field.type}
            value={field.value}
            placeholder={field.placeholder}
            inputClass={`${inputClass(field.name || "")} ${field.type === "password" ? "pr-12" : ""}`}
            onChangeHandler={field.onChange || handleInputChange}
            required={field.required}
            suffix={field.suffix}
            error={props.errorField === field.name ? props.error : ""}
          >
            {field.children}
          </FormControl>
        );
      })}

      <Button
        type="submit"
        disabled={loading || !passwordValid || !passwordsMatch || !role}
        className="w-full py-8 rounded-full text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {loading ? "Joining..." : "Join CogniCare"}
      </Button>
    </form>
  );
}
