import {
  CARER,
  CONFIRM_PASSWORD,
  CONFIRM_PASSWORD_PLACEHOLDER,
  EMAIL,
  EMAIL_OR_PHONE_TEXT,
  EMAIL_PLACEHOLDER,
  FAMILY_CONTACT,
  FAMILY_NAME_PLACEHOLDER,
  FULL_NAME,
  NAME_PLACEHOLDER,
  PASSWORD,
  PASSWORD_DOESNT_MATCH,
  PASSWORD_MATCH,
  PASSWORD_PLACEHOLDER,
  PATIENT,
  PATIENT_ID_PLACEHOLDER,
  PATIENT_OR_CARER,
  PHONE,
  PHONE_PLACEHOLDER,
} from "@/constants/registerationPage";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { PATIENT_ID } from "@/constants/carerLandingPage";
import { FormConfigProps, PasswordRulesConfig, RegistrationFieldConfig } from "../types/registerationForm";

export const getRegisterationFields = ({
  showPassword,
  setShowPassword,
  password,
  setPassword,
  passwordTouched,
  setPasswordTouched,
  passwordRules,
  showConfirm,
  setShowConfirm,
  confirmPassword,
  setConfirmPassword,
  passwordsMatch,
  role,
  setRole,
  errorField,
  setErrorField,
  setError,
}: FormConfigProps): { fields: RegistrationFieldConfig[]; familyFields: RegistrationFieldConfig[] } => {
  const fields = [
    { name: "name", text: FULL_NAME, placeholder: NAME_PLACEHOLDER, required: true, isRole: false as const, isFamilySection: false as const },
    { name: "emailOrPhone", text: EMAIL_OR_PHONE_TEXT, required: true, isRole: false as const, isFamilySection: false as const },
    {
      name: "password",
      text: PASSWORD,
      placeholder: PASSWORD_PLACEHOLDER,
      type: showPassword ? "text" : "password",
      value: password,
      required: true,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setPasswordTouched(true);
        if (errorField === "password") {
          setErrorField("");
          setError("");
        }
      },
      isRole: false as const,
      isFamilySection: false as const,
      suffix: (
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          onClick={() => setShowPassword((v: boolean) => !v)}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      ),
      children: passwordTouched && (
        <ul className="mt-2 space-y-1 pl-1 animate-in fade-in duration-300">
          {passwordRules.map((rule: PasswordRulesConfig) => {
            const passed = rule.test(password);
            return (
              <li
                key={rule.id}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  passed ? "text-green-600" : "text-slate-400"
                }`}
              >
                {passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                {rule.label}
              </li>
            );
          })}
        </ul>
      ),
    },
    {
      name: "confirmPassword",
      text: CONFIRM_PASSWORD,
      placeholder: CONFIRM_PASSWORD_PLACEHOLDER,
      type: showConfirm ? "text" : "password",
      value: confirmPassword,
      required: true,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (errorField === "confirmPassword") {
          setErrorField("");
          setError("");
        }
      },
      isRole: false as const,
      isFamilySection: false as const,
      suffix: (
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          onClick={() => setShowConfirm((v: boolean) => !v)}
          tabIndex={-1}
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      ),
      children: confirmPassword.length > 0 && (
        <p className={`text-xs font-medium ml-1 ${passwordsMatch ? "text-green-600" : "text-destructive"}`}>
          {passwordsMatch ? PASSWORD_MATCH : PASSWORD_DOESNT_MATCH}
        </p>
      ),
    },
    {
      name: "role",
      text: PATIENT_OR_CARER,
      isRole: true as const,
      onChange: (r: "PATIENT" | "CARER") => {
        setRole(r.toUpperCase() as "PATIENT" | "CARER");
        if (errorField === "role") {
          setErrorField("");
          setError("");
        }
      },
      isFamilySection: false as const,
    },
    {
      name: "patientId",
      text: PATIENT_ID,
      placeholder: PATIENT_ID_PLACEHOLDER,
      required: true,
      renderIf: role === "CARER",
      containerClass: "space-y-2 animate-in slide-in-from-top-4 fade-in duration-500",
      isRole: false as const,
      isFamilySection: false as const,
    },
    {
      name: "familySection",
      text: FAMILY_CONTACT,
      isFamilySection: true as const,
      isRole: false as const,
      renderIf: role === "PATIENT",
    },
  ];

  const familyFields: RegistrationFieldConfig[] = [
    { name: "familyMemberName", text: FULL_NAME, placeholder: FAMILY_NAME_PLACEHOLDER, isRole: false as const, isFamilySection: false as const },
    { name: "familyMemberEmail", text: EMAIL, placeholder: EMAIL_PLACEHOLDER, isRole: false as const, isFamilySection: false as const },
    { name: "familyMemberPhone", text: PHONE, placeholder: PHONE_PLACEHOLDER, isRole: false as const, isFamilySection: false as const },
  ];

  return { fields: fields as RegistrationFieldConfig[], familyFields };
};


export const getPasswordRules = () => {
  const passwordRules: PasswordRulesConfig[] = [
    {
      id: "length",
      label: "At least 8 characters",
      test: (p: string) => p.length >= 8,
    },
    {
      id: "upper",
      label: "One uppercase letter (A–Z)",
      test: (p: string) => /[A-Z]/.test(p),
    },
    {
      id: "lower",
      label: "One lowercase letter (a–z)",
      test: (p: string) => /[a-z]/.test(p),
    },
    {
      id: "special",
      label: "One special character (!@#$...)",
      test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
    },
  ];

  return { passwordRules };
}