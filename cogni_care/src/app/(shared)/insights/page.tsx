"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import InsightsDashboard from "@/features/insights/components/InsightsDashboard";
import CarerInsightsSelector from "@/features/insights/components/CarerInsightsSelector";
import { Loader2 } from "lucide-react";

function InsightsController() {
    const { user, loading } = useAuth();
    const searchParams = useSearchParams();
    const patientId = searchParams?.get("patientId");

    if (loading) {
        return <div className="flex w-full min-h-screen items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
    }

    // If Carer and no patient is selected, show the list of patients
    if (user?.isCarer && !patientId) {
        return <CarerInsightsSelector />;
    }

    // Otherwise, show the dashboard itself (using the patientId or fallback to ProfilePatient)
    return <InsightsDashboard />;
}

export default function InsightsPage() {
    return (
        <Suspense fallback={<div className="flex w-full min-h-screen items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
            <InsightsController />
        </Suspense>
    );
}
