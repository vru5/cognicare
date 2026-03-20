"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AppError } from "server/types/logsApi";
import { SIGN_IN } from "@/constants/registrationPage";
import { ACCOUNT_TEXT, REGISTER_HERE, SIGN_IN_SUB_HEADER, SIGNING_IN_TEXT, WELCOME_HEADER } from "@/constants/loginPage";
import { FormControl } from "@/components/shared/FormControl";
import { getLoginFields } from "../constants/loginFormConfig";
import { LoginFieldConfig } from "../types/loginForm";
import { loginSchema, LoginFormData } from "../schemas/loginSchema";

export default function LoginForm() {
    const router = useRouter();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { emailOrPhone: "", password: "" },
        mode: "onBlur",
    });

    const { watch, setValue, formState: { errors, isSubmitting } } = form;
    const emailOrPhone = watch("emailOrPhone");
    const password = watch("password");

    const onSubmit = async (data: LoginFormData) => {
        setServerError(null);
        try {
            const authUser = await login(data.emailOrPhone, data.password);
            if (authUser.isCarer) {
                router.push("/dashboard");
            } else {
                router.push("/brain-dump");
            }
        } catch (error: unknown) {
            const err = error as AppError;
            setServerError(err.message || "Something went wrong. Please try again.");
        }
    };

    const inputClass = (hasError: boolean) =>
        `w-full p-4 rounded-2xl border bg-white/50 text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300 shadow-sm focus:ring-2 ${hasError
            ? "border-destructive focus:ring-destructive/20"
            : "border-slate-200 focus:ring-primary focus:border-primary"
        }`;

    const labelClass = (hasError: boolean) =>
        `text-sm font-bold ml-1 transition-colors ${hasError ? "text-destructive" : "text-foreground/60"}`;

    return (
        <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/80 backdrop-blur-2xl ring-1 ring-slate-200/50">
            <CardHeader className="space-y-3 pb-8 text-center">
                <CardTitle className="text-4xl font-extrabold tracking-tight text-foreground">
                    {WELCOME_HEADER}
                </CardTitle>
                <CardDescription className="text-primary font-bold italic text-lg tracking-tight">
                    {SIGN_IN_SUB_HEADER}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {getLoginFields({
                        emailOrPhone,
                        setEmailOrPhone: (val: string) => { setValue("emailOrPhone", val, { shouldValidate: true }); setServerError(null); },
                        password,
                        setPassword: (val: string) => { setValue("password", val, { shouldValidate: true }); setServerError(null); },
                        showPassword,
                        setShowPassword,
                        setError: setServerError,
                        error: serverError,
                    }).map((field: LoginFieldConfig) => (
                        <FormControl
                            key={field.id}
                            id={field.id}
                            text={field.text}
                            name={field.name}
                            type={field.type}
                            autoComplete={field.autoComplete}
                            required={field.required}
                            value={field.value}
                            onChangeHandler={field.onChange}
                            placeholder={field.placeholder}
                            inputClass={inputClass(!!errors[field.name as keyof LoginFormData])}
                            labelClass={labelClass(!!errors[field.name as keyof LoginFormData])}
                            containerClass="space-y-2"
                            suffix={field.suffix}
                            error={errors[field.name as keyof LoginFormData]?.message}
                        />
                    ))}

                    {serverError && (
                        <p className="text-destructive text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 duration-300">
                            {serverError}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-8 rounded-full text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-tight"
                    >
                        {isSubmitting && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                        {isSubmitting ? `${SIGNING_IN_TEXT}` : `${SIGN_IN}`}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="justify-center pb-8 border-t border-slate-100/50 mt-4 pt-6">
                <p className="text-center text-sm font-medium text-foreground/50">
                    {ACCOUNT_TEXT}{" "}
                    <Link href="/register" className="text-primary font-bold hover:underline ml-1">
                        {REGISTER_HERE}
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
