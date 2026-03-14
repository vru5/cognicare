"use client";

import { useState } from "react";
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


import { RegistrationFormFields } from "../types/registerationForm";
import { RegisterationFormFields } from "./RegisterationFormFields";
import { JOIN_CONGNICARE, MEMBERSHIP_ACTIVE, REGISTERATION_CARD_DESCRIPTION, SIGN_IN } from "@/constants/registerationPage";
import { getPasswordRules } from "../constants/registerationFormConfig";

const { passwordRules } = getPasswordRules();

export function RegistrationForm() {
  const [role, setRole] = useState<"PATIENT" | "CARER" | "">("");
  const [formData, setFormData] = useState<RegistrationFormFields>({
    name: "",
    emailOrPhone: "",
    patientId: "",
    familyMemberName: "",
    familyMemberEmail: "",
    familyMemberPhone: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState("");
  const router = useRouter();
  const { login, register } = useAuth();

  const passwordValid = passwordRules.every((r) => r.test(password));
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorField("");

    if (!passwordValid) {
      setError("Password does not meet the requirements.");
      setErrorField("password");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      setErrorField("confirmPassword");
      return;
    }

    setLoading(true);
    try {
      await register({ role, ...formData, password });
      await login(formData.emailOrPhone, password);
      router.push("/login");
    } catch (error: unknown) {
      const err = error as AppError;
      console.error("Registration error:", err);
      const fullMessage =
        err.message || "Registration failed. Please try again.";
      const firstLine = fullMessage.split("\n")[0].split(". ")[0];
      setError(firstLine);

      const msg = firstLine.toLowerCase();
      if (msg.includes("already exists")) setErrorField("emailOrPhone");
      else if (msg.includes("name")) setErrorField("name");
      else if (msg.includes("email") || msg.includes("phone"))
        setErrorField("emailOrPhone");
      else if (msg.includes("patient id")) setErrorField("patientId");
      else if (msg.includes("family")) setErrorField("familyMemberName");
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorField === name) {
      setErrorField("");
      setError("");
    }
  };

  return (
    <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/80 backdrop-blur-2xl ring-1 ring-slate-200/50">
      <CardHeader className="space-y-3 pb-8 text-center">
        <CardTitle className="text-4xl font-extrabold tracking-tight text-foreground">
          {JOIN_CONGNICARE}
        </CardTitle>
        <CardDescription className="text-primary font-bold italic text-lg tracking-tight">
          {REGISTERATION_CARD_DESCRIPTION}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="mb-6 text-destructive text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </p>
        )}
        <RegisterationFormFields
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          loading={loading}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          passwordValid={passwordValid}
          passwordsMatch={passwordsMatch}
          passwordTouched={passwordTouched}
          setPasswordTouched={setPasswordTouched}
          passwordRules={passwordRules}
          role={role}
          setRole={setRole}
          errorField={errorField}
          setErrorField={setErrorField}
          setError={setError}
        />
      </CardContent>
      <CardFooter className="justify-center pb-8 border-t border-slate-100/50 mt-4 pt-6">
        <p className="text-sm font-medium text-foreground/50">
          {MEMBERSHIP_ACTIVE}{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline ml-1"
          >
            {SIGN_IN}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
