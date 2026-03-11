"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
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
        } catch (err: any) {
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
                    Welcome back
                </CardTitle>
                <CardDescription className="text-primary font-bold italic text-lg tracking-tight">
                    Sign in to your CogniCare account
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className={labelClass(!!error)}
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(null); }}
                            placeholder="you@example.com"
                            className={inputClass(!!error)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className={labelClass(!!error)}
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                placeholder="••••••••"
                                className={inputClass(!!error)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

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
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="justify-center pb-8 border-t border-slate-100/50 mt-4 pt-6">
                <p className="text-center text-sm font-medium text-foreground/50">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-primary font-bold hover:underline ml-1">
                        Register here
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
