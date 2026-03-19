export interface AddLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    onSuccess: (log: LogSummaryCard) => void;
}
export interface Patient {
    id: string;
    name: string;
    hasNewLog: boolean;
    accessSymptomLogs: boolean;
}

export type SymptomPillar = "physical" | "mood" | "cognitive" | "sleep" | "social";

export interface CarerNote {
    id: string;
    createdAt: Date | string;
    text: string;
    carerId: string;
    carerName?: string;
}

export interface LogSummaryCard extends Record<SymptomPillar, string | null | undefined> {
    id: string;
    physicalSeverity?: number | null;
    moodSeverity?: number | null;
    cognitiveSeverity?: number | null;
    sleepSeverity?: number | null;
    socialSeverity?: number | null;
    createdAt: Date | string;
    patientId: string;
    rawText: string;
    notes?: CarerNote[];
    isFromCarer?: boolean; // Kept for UI compatibility during transition or for standalone logs
    carerId?: string;
    carerName?: string;
    type: "patient" | "carer";
};

export type MoodPillarsConfig = Partial<Record<SymptomPillar, Config>>;

interface Config {
    icon: unknown;
    color: string;
    label: string;
}

export interface BaseResponse {
    success: boolean;
    error?: string;
}

export interface LogResponse extends BaseResponse {
    log: LogSummaryCard;
}

export interface LogsResponse extends BaseResponse {
    logs: LogSummaryCard[];
    restricted?: boolean;
}