import { Dispatch, SetStateAction } from "react";

export interface LoginFormConfigProps {
    emailOrPhone: string;
    setEmailOrPhone: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    showPassword: boolean;
    setShowPassword: Dispatch<SetStateAction<boolean>>;
    setError: (v: string | null) => void;
    error: string | null;
    inputClass: (fieldError: boolean) => string;
    labelClass: (fieldError: boolean) => string;
}

export interface LoginFieldConfig {
    id: string;
    name: string;
    text: string;
    placeholder: string;
    type: string;
    autoComplete: string;
    value: string;
    required: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    suffix?: React.ReactNode;
}
