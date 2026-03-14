import { SymptomPillar } from "@/features/logs/types/logSummaryCard";

export interface AnalysisCard extends Record<SymptomPillar, string | null | undefined> {
    message: string;
}