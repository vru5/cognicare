"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email, password);
            router.push("/brain-dump");
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/60">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-black text-[#0a2e4d] tracking-tight">Welcome back</h1>
                <p className="text-slate-500 mt-2 text-sm">Sign in to your CogniCare account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="email"
                        className={`block text-sm font-bold mb-1.5 ${error ? "text-red-600" : "text-slate-700"}`}
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
                        className={`w-full rounded-xl border px-4 py-3 text-sm bg-white text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:ring-2 ${error
                            ? "border-red-400 focus:ring-red-200"
                            : "border-slate-200 focus:ring-[#0a2e4d]/20 focus:border-[#0a2e4d]"
                            }`}
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className={`block text-sm font-bold mb-1.5 ${error ? "text-red-600" : "text-slate-700"}`}
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(null); }}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border px-4 py-3 text-sm bg-white text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:ring-2 ${error
                            ? "border-red-400 focus:ring-red-200"
                            : "border-slate-200 focus:ring-[#0a2e4d]/20 focus:border-[#0a2e4d]"
                            }`}
                    />
                </div>

                {error && (
                    <p className="text-red-600 text-sm font-semibold">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0a2e4d] hover:bg-[#0d3a61] text-white font-black py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
                Don&apos;t have an account?{" "}
                <a href="/registration" className="text-[#0a2e4d] font-bold hover:underline">
                    Register here
                </a>
            </p>
        </div>
    );
}
