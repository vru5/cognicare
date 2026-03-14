export type SymptomPillar = "physical" | "mood" | "cognitive" | "sleep" | "social";

export interface LogSumaryCard extends Record<SymptomPillar, string | null | undefined> {
    id: string;
    createdAt: Date | string;
    patientId: string;
    rawText: string;
    carerComment?: string | null;
    isFromCarer?: boolean;
};

export type MoodPillarsConfig = Partial<Record<SymptomPillar, Config>>;

interface Config {
    icon: unknown;
    color: string;
    label: string;
}