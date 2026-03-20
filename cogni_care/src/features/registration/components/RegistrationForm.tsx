"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { AppError } from "server/types/logsApi";
import { RegistrationFormFields } from "./RegistrationFormFields";
import { JOIN_COGNICARE, MEMBERSHIP_ACTIVE, REGISTRATION_CARD_DESCRIPTION, SIGN_IN } from "@/constants/registrationPage";
import { getPasswordRules } from "../constants/registrationFormConfig";
import { registrationSchema, RegistrationFormData } from "../schemas/registrationSchema";

const { passwordRules } = getPasswordRules();

export function RegistrationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();
  const { login, register } = useAuth();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      emailOrPhone: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      patientId: "",
      familyMemberName: "",
      familyMemberEmail: "",
      familyMemberPhone: "",
    },
    mode: "onBlur",
  });

  const { watch, setValue, formState: { errors, isSubmitting } } = form;
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const role = watch("role") ?? "";
  const passwordTouched = !!form.formState.touchedFields.password;

  const passwordValid = passwordRules.every((r) => r.test(password || ""));
  const passwordsMatch = !!confirmPassword && password === confirmPassword;

  const handleSubmit = form.handleSubmit(async (data: RegistrationFormData) => {
    setServerError("");
    try {
      await register({ role: data.role, name: data.name, emailOrPhone: data.emailOrPhone, patientId: data.patientId, familyMemberName: data.familyMemberName, familyMemberEmail: data.familyMemberEmail, familyMemberPhone: data.familyMemberPhone, password: data.password } as any);
      await login(data.emailOrPhone, data.password);
      router.push("/login");
    } catch (error: unknown) {
      const err = error as AppError;
      const firstLine = (err.message || "Registration failed.").split("\n")[0].split(". ")[0];
      setServerError(firstLine);
    }
  });

  // Adapt RHF setValue to match the existing handleInputChange signature
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValue(name as keyof RegistrationFormData, value as any, { shouldValidate: true, shouldTouch: true });
    if (serverError) setServerError("");
  };

  // Field-level error lookup for RegisterationFormFields' errorField/error props
  const fieldNames = ["name", "emailOrPhone", "password", "confirmPassword", "patientId", "familyMemberName", "familyMemberEmail", "familyMemberPhone"] as const;
  const firstErrorField = fieldNames.find((f) => errors[f]);
  const firstErrorMessage = firstErrorField ? errors[firstErrorField]?.message ?? "" : "";

  return (
    <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/80 backdrop-blur-2xl ring-1 ring-slate-200/50">
      <CardHeader className="space-y-3 pb-8 text-center">
        <CardTitle className="text-4xl font-extrabold tracking-tight text-foreground">
          {JOIN_COGNICARE}
        </CardTitle>
        <CardDescription className="text-primary font-bold italic text-lg tracking-tight">
          {REGISTRATION_CARD_DESCRIPTION}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {serverError && (
          <p className="mb-6 text-destructive text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 duration-300">
            {serverError}
          </p>
        )}
        <RegistrationFormFields
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          loading={isSubmitting}
          password={password || ""}
          setPassword={(val: string) => setValue("password", val, { shouldValidate: true, shouldTouch: true })}
          confirmPassword={confirmPassword || ""}
          setConfirmPassword={(val: string) => setValue("confirmPassword", val, { shouldValidate: true })}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          passwordValid={passwordValid}
          passwordsMatch={passwordsMatch}
          passwordTouched={passwordTouched}
          setPasswordTouched={() => { /* handled by RHF touchedFields */ }}
          passwordRules={passwordRules}
          role={role as "PATIENT" | "CARER" | ""}
          setRole={(r) => setValue("role", r as "PATIENT" | "CARER", { shouldValidate: true })}
          errorField={firstErrorField ?? ""}
          setErrorField={() => { /* handled by RHF */ }}
          setError={setServerError}
          error={firstErrorMessage}
        />
      </CardContent>
      <CardFooter className="justify-center pb-8 border-t border-slate-100/50 mt-4 pt-6">
        <p className="text-sm font-medium text-foreground/50">
          {MEMBERSHIP_ACTIVE}{" "}
          <Link href="/login" className="text-primary font-bold hover:underline ml-1">
            {SIGN_IN}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
