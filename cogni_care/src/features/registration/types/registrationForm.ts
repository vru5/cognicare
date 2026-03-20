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
  error?: string;
}

export interface RegistrationFormFieldsProps extends FormConfigProps {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  passwordValid: boolean;
}

export interface BaseFieldConfig {
  name: string;
  text?: string;
  placeholder?: string;
  required?: boolean;
  renderIf?: boolean;
  containerClass?: string;
}

export interface InputFieldConfig extends BaseFieldConfig {
  isRole?: false;
  isFamilySection?: false;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suffix?: React.ReactNode;
  children?: React.ReactNode;
}

export interface RoleFieldConfig extends BaseFieldConfig {
  isRole: true;
  isFamilySection?: false;
  onChange?: (val: "PATIENT" | "CARER") => void;
}

export interface SectionFieldConfig extends BaseFieldConfig {
  isFamilySection: true;
  isRole?: false;
}

export type RegistrationFieldConfig = InputFieldConfig | RoleFieldConfig | SectionFieldConfig;

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
  error?: string;
}

export interface PasswordRulesConfig {
    id: string;
    label: string;
    test: (p: string) => boolean;
}