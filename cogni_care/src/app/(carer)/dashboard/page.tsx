"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, User, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { EMPTY_LIST_SUBHEADING, EMPTY_PATIENT_LIST, HEADING, PATIENT_ID, SUB_HEADING } from "@/constants/carerLandingPage";
import { API_BASE_URL } from "@/constants/auth";

interface Patient {
    id: string;
    name: string;
    hasNewLog: boolean;
}

export default function CarerDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Track viewed patients locally to hide green dot immediately without refresh
    const viewedPatientsRef = useRef<Set<string>>(new Set());
    const [, forceUpdate] = useState({});

    useEffect(() => {
        if (!authLoading && (!user || !user.isCarer)) {
            router.push("/brain-dump");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user?.isCarer && user.profileId) {
            fetchPatients();
        }
    }, [user]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/carer/patients?carerProfileId=${user?.profileId}`);
            const data = await res.json();
            if (data.success) {
                setPatients(data.patients);
            } else {
                setError(data.error || "Failed to fetch patients");
            }
        } catch (err: unknown) {
            console.log("Error: ", err);
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const handlePatientClick = async (patientId: string) => {
        // Optimistically update UI using useRef as suggested by user
        viewedPatientsRef.current.add(patientId);
        forceUpdate({}); // Trigger re-render to hide dot

        // Notify backend
        try {
            await fetch(`${API_BASE_URL}/api/carer/mark-viewed`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    carerProfileId: user?.profileId,
                    patientId
                }),
            });
        } catch (err: unknown) {
            console.error("Failed to mark patient as viewed on server", err);
        }
    };

    if (authLoading || (loading && patients.length === 0)) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto p-4 space-y-6 animate-in fade-in duration-500">
            <header className="space-y-1">
                <h1 className="text-3xl font-black text-foreground tracking-tight">{HEADING}</h1>
                <p className="text-muted-foreground font-medium">{SUB_HEADING}</p>
            </header>

            {error && (
                <div className="p-4 rounded-2xl bg-destructive/10 text-destructive font-bold text-center border border-destructive/20">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
                {patients.length === 0 && !loading && (
                    <Card className="border-dashed bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                            <User className="h-12 w-12 text-slate-300" />
                            <div className="space-y-1">
                                <p className="font-bold text-slate-600">{EMPTY_PATIENT_LIST}</p>
                                <p className="text-sm text-slate-400">{EMPTY_LIST_SUBHEADING}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {patients.map((patient) => {
                    const showDot = patient.hasNewLog && !viewedPatientsRef.current.has(patient.id);

                    return (
                        <Link
                            key={patient.id}
                            href={`/logs?patientId=${patient.id}`}
                            onClick={() => handlePatientClick(patient.id)}
                            className="block group"
                        >
                            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] border-slate-100 bg-white/80 backdrop-blur-xl">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User className="h-6 w-6" />
                                            </div>
                                            {showDot && (
                                                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-black text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">
                                                {patient.name}
                                            </h3>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                {PATIENT_ID} : {patient.id}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
