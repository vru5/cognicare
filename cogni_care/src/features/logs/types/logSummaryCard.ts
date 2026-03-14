export type SymptomPillar = "physical" | "mood" | "cognitive" | "sleep" | "social";

export interface CarerComment {
    id: string;
    createdAt: Date | string;
    text: string;
    carerId: string;
    carerName?: string;
}

export interface LogSumaryCard extends Record<SymptomPillar, string | null | undefined> {
    id: string;
    createdAt: Date | string;
    patientId: string;
    rawText: string;
    comments?: CarerComment[];
    isFromCarer?: boolean; // Kept for UI compatibility during transition or for standalone logs
    carerId?: string;
    type: "patient" | "carer";
};

export type MoodPillarsConfig = Partial<Record<SymptomPillar, Config>>;

interface Config {
    icon: unknown;
    color: string;
    label: string;
}