"use client";

import { Suspense } from "react";
import LogsContent from "@/features/logs/components/LogContent";
import { INITIALIZING } from "@/constants/logPage";



export default function LogsPage() {
    return (
        <Suspense fallback={
            <div className="w-full min-h-screen flex items-center justify-center bg-brand-gradient">
                <div className="animate-pulse text-white font-bold">{INITIALIZING}</div>
            </div>
        }>
            <LogsContent />
        </Suspense>
    );
}
