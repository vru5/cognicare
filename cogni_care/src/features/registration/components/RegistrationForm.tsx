"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const passwordRules = [
    { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { id: "upper", label: "One uppercase letter (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
    { id: "lower", label: "One lowercase letter (a–z)", test: (p: string) => /[a-z]/.test(p) },
    { id: "special", label: "One special character (!@#$...)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export function RegistrationForm() {
    const [role, setRole] = useState<"PATIENT" | "CARER" | "">("");
    const [formData, setFormData] = useState({
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

    const passwordValid = passwordRules.every(r => r.test(password));
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errorField === name) {
            setErrorField("");
            setError("");
        }
    };

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
        } catch (err: any) {
            console.error("Registration error:", err);
            const fullMessage = err.message || "Registration failed. Please try again.";
            const firstLine = fullMessage.split("\n")[0].split(". ")[0];
            setError(firstLine);

            const msg = firstLine.toLowerCase();
            if (msg.includes("already exists")) setErrorField("emailOrPhone");
            else if (msg.includes("name")) setErrorField("name");
            else if (msg.includes("email") || msg.includes("phone")) setErrorField("emailOrPhone");
            else if (msg.includes("patient id")) setErrorField("patientId");
            else if (msg.includes("family")) setErrorField("familyMemberName");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field: string) =>
        `w-full p-4 rounded-2xl border bg-white/50 text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300 shadow-sm focus:ring-2 ${errorField === field
            ? "border-destructive focus:ring-destructive/20"
            : "border-slate-200 focus:ring-primary focus:border-primary"
        }`;

    const labelClass = (field: string) =>
        `text-sm font-bold ml-1 transition-colors ${errorField === field ? "text-destructive" : "text-foreground/60"}`;

    return (
        <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/80 backdrop-blur-2xl ring-1 ring-slate-200/50">
            <CardHeader className="space-y-3 pb-8 text-center">
                <CardTitle className="text-4xl font-extrabold tracking-tight text-foreground">
                    Join CogniCare
                </CardTitle>
                <CardDescription className="text-primary font-bold italic text-lg tracking-tight">
                    Empowering caregivers &amp; patients with intelligent health insights.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <p className="mb-6 text-destructive text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 duration-300">
                        {error}
                    </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className={labelClass("name")}>Full Name</label>
                        <input
                            name="name"
                            placeholder="John Doe"
                            required
                            className={inputClass("name")}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Email or Phone */}
                    <div className="space-y-2">
                        <label className={labelClass("emailOrPhone")}>Email or Phone</label>
                        <input
                            name="emailOrPhone"
                            placeholder="name@example.com"
                            required
                            className={inputClass("emailOrPhone")}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className={labelClass("password")}>Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                placeholder="Create a strong password"
                                required
                                className={`${inputClass("password")} pr-12`}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordTouched(true);
                                    if (errorField === "password") { setErrorField(""); setError(""); }
                                }}
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                onClick={() => setShowPassword(v => !v)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Password strength checklist */}
                        {passwordTouched && (
                            <ul className="mt-2 space-y-1 pl-1 animate-in fade-in duration-300">
                                {passwordRules.map(rule => {
                                    const passed = rule.test(password);
                                    return (
                                        <li key={rule.id} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${passed ? "text-green-600" : "text-slate-400"}`}>
                                            {passed
                                                ? <CheckCircle2 size={13} className="shrink-0" />
                                                : <XCircle size={13} className="shrink-0" />}
                                            {rule.label}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className={labelClass("confirmPassword")}>Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                placeholder="Re-enter your password"
                                required
                                className={`${inputClass("confirmPassword")} pr-12`}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (errorField === "confirmPassword") { setErrorField(""); setError(""); }
                                }}
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                onClick={() => setShowConfirm(v => !v)}
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {confirmPassword.length > 0 && (
                            <p className={`text-xs font-medium ml-1 transition-colors ${passwordsMatch ? "text-green-600" : "text-destructive"}`}>
                                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                            </p>
                        )}
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground/60 ml-1">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-500 cursor-pointer ${role === "PATIENT" ? "border-primary bg-primary/10 shadow-[0_8px_16px_rgba(var(--primary),0.1)]" : "border-slate-100 bg-slate-50/50 hover:border-primary/30"}`}>
                                <input type="radio" name="role" value="PATIENT" className="sr-only" onChange={() => setRole("PATIENT")} required />
                                <span className={`text-lg font-bold transition-colors ${role === "PATIENT" ? "text-primary" : "text-foreground/40"}`}>Patient</span>
                            </label>
                            <label className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-500 cursor-pointer ${role === "CARER" ? "border-primary bg-primary/10 shadow-[0_8px_16px_rgba(var(--primary),0.1)]" : "border-slate-100 bg-slate-50/50 hover:border-primary/30"}`}>
                                <input type="radio" name="role" value="CARER" className="sr-only" onChange={() => setRole("CARER")} required />
                                <span className={`text-lg font-bold transition-colors ${role === "CARER" ? "text-primary" : "text-foreground/40"}`}>Carer</span>
                            </label>
                        </div>
                    </div>

                    {/* Carer: Patient ID */}
                    {role === "CARER" && (
                        <div className="space-y-2 animate-in slide-in-from-top-4 fade-in duration-500">
                            <label className={labelClass("patientId")}>Patient ID</label>
                            <input
                                name="patientId"
                                placeholder="Enter the ID of the patient you care for"
                                required
                                className={inputClass("patientId")}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}

                    {/* Patient: Family Member */}
                    {role === "PATIENT" && (
                        <div className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-500">
                            <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-5">
                                <h4 className="font-bold text-foreground text-sm tracking-wide">Family Member Contact</h4>
                                <div className="space-y-2">
                                    <label className={`text-xs font-bold ml-1 uppercase tracking-wider transition-colors ${errorField === "familyMemberName" ? "text-destructive" : "text-foreground/40"}`}>Full Name</label>
                                    <input name="familyMemberName" placeholder="Name of your contact" className={`w-full p-4 rounded-2xl border bg-white text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 ${errorField === "familyMemberName" ? "border-destructive focus:ring-destructive/20" : "border-slate-200 focus:ring-primary focus:border-primary"}`} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className={`text-xs font-bold ml-1 uppercase tracking-wider ${errorField === "familyMemberEmail" ? "text-destructive" : "text-foreground/40"}`}>Email</label>
                                        <input name="familyMemberEmail" placeholder="contact@email.com" className={`w-full p-4 rounded-2xl border bg-white text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 ${errorField === "familyMemberEmail" ? "border-destructive focus:ring-destructive/20" : "border-slate-200 focus:ring-primary focus:border-primary"}`} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`text-xs font-bold ml-1 uppercase tracking-wider ${errorField === "familyMemberPhone" ? "text-destructive" : "text-foreground/40"}`}>Phone</label>
                                        <input name="familyMemberPhone" placeholder="+1 (555) 000-0000" className={`w-full p-4 rounded-2xl border bg-white text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 ${errorField === "familyMemberPhone" ? "border-destructive focus:ring-destructive/20" : "border-slate-200 focus:ring-primary focus:border-primary"}`} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading || !passwordValid || !passwordsMatch}
                        className="w-full py-8 rounded-full text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-tight"
                    >
                        {loading ? "Joining..." : "Join CogniCare"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center pb-8 border-t border-slate-100/50 mt-4 pt-6">
                <p className="text-sm font-medium text-foreground/50">
                    Membership active? <Link href="/login" className="text-primary font-bold hover:underline ml-1">Sign In</Link>
                </p>
            </CardFooter>
        </Card>
    );
}
