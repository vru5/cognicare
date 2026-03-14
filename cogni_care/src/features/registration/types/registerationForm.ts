export interface RegistrationFormFields {
    name: string;
    emailOrPhone: string;
    patientId?: string;
    familyMemberName?: string;
    familyMemberEmail?: string;
    familyMemberPhone?: string;
}

export interface FormConfigProps {
  showPassword: boolean;
  setShowPassword: (v: boolean | ((v: boolean) => boolean)) => void;
  password: string;
  setPassword: (v: string) => void;
  passwordTouched: boolean;
  setPasswordTouched: (v: boolean) => void;
  passwordRules: PasswordRulesConfig[];
  showConfirm: boolean;
  setShowConfirm: (v: boolean | ((v: boolean) => boolean)) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  passwordsMatch: boolean;
  role: "PATIENT" | "CARER" | "";
  setRole: React.Dispatch<React.SetStateAction<"PATIENT" | "CARER" | "">>;
  errorField: string;
  setErrorField: (v: string) => void;
  setError: (v: string) => void;
}

export interface RegisterationFormFieldsProps extends FormConfigProps {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  passwordValid: boolean;
}

export interface RegistrationFieldConfig {
  name: string;
  text?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value?: string;
  onChange?: (val: any) => void;
  suffix?: React.ReactNode;
  children?: React.ReactNode;
  renderIf?: boolean;
  isRole?: boolean;
  isFamilySection?: boolean;
  containerClass?: string;
}

export interface FormControlProps {
  containerClass?: string;
  labelClass?: string;
  text: string;
  name: string;
  placeholder?: string;
  inputClass?: string;
  onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  onClick?: () => void;
  type?: string;
  value?: string;
  suffix?: React.ReactNode;
  children?: React.ReactNode;
  id?: string;
  autoComplete?: string;
}

export interface PasswordRulesConfig {
    id: string;
    label: string;
    test: (p: string) => boolean;
}