import { SymptomPillar } from "@/features/logs/types/logTypes";


export interface AnalysisCard extends Record<SymptomPillar, string | null | undefined> {
    message: string;
}