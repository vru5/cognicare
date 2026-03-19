import { SymptomPillar } from "@/features/logs/types/logTypes";


export interface AnalysisCard extends Record<SymptomPillar, string | null | undefined> {
    logId?: string;
    message: string;
    physicalSeverity?: number | null;
    moodSeverity?: number | null;
    cognitiveSeverity?: number | null;
    sleepSeverity?: number | null;
    socialSeverity?: number | null;
}