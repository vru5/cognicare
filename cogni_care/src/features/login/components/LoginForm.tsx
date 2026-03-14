"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AppError } from "server/types/logsApi";
import { SIGN_IN } from "@/constants/registerationPage";
import { ACCOUNT_TEXT, REGISTER_HERE, SIGN_IN_SUB_HEADER, SIGNING_IN_TEXT, WELCOME_HEADER } from "@/constants/loginPage";
import { FormControl } from "@/components/shared/FormControl";
import { getLoginFields } from "../constants/loginFormConfig";
import { LoginFieldConfig } from "../types/loginForm";

export default function LoginForm() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const authUser = await login(email, password);
            if (authUser.isCarer) {
                router.push("/dashboard");
            } else {
                router.push("/brain-dump");
            }
        } catch (error: unknown) {
            const err = error as AppError;
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (fieldError: boolean) =>
        `w-full p-4 rounded-2xl border bg-white/50 text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300 shadow-sm focus:ring-2 ${fieldError
            ? "border-destructive focus:ring-destructive/20"
            : "border-slate-200 focus:ring-primary focus:border-primary"
        }`;

    const labelClass = (fieldError: boolean) =>
        `text-sm font-bold ml-1 transition-colors ${fieldError ? "text-destructive" : "text-foreground/60"}`;

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
                <form onSubmit={handleSubmit} className="space-y-6">
                    {getLoginFields({
                        email,
                        setEmail,
                        password,
                        setPassword,
                        showPassword,
                        setShowPassword,
                        setError,
                        error,
                        inputClass,
                        labelClass,
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
                            inputClass={inputClass(!!error)}
                            labelClass={labelClass(!!error)}
                            containerClass="space-y-2"
                            suffix={field.suffix}
                        />
                    ))}

                    {error && (
                        <p className="text-destructive text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 duration-300">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-8 rounded-full text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-tight"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                        {loading ? `${SIGNING_IN_TEXT}` : `${SIGN_IN}`}
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
