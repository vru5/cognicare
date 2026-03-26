export interface AppError {
    message: string;
    status?: number;
    code?: string;
};

export interface Analysis {
    physical?: string | null;
    physicalSeverity?: number | null;
    mood?: string | null;
    moodSeverity?: number | null;
    cognitive?: string | null;
    cognitiveSeverity?: number | null;
    sleep?: string | null;
    sleepSeverity?: number | null;
    social?: string | null;
    socialSeverity?: number | null;
} 

export interface SymptomRecord extends Analysis {
    id: string;
    createdAt: Date | string;
    patientId: string;
    rawText: string;
    isFromCarer?: boolean;
    carerId?: string | null;
    notes?: CarerNoteRecord[];
    comments?: CarerNoteRecord[];
}

export interface SymptomLogUpdateData extends Analysis {
    rawText?: string;
    isFromCarer?: boolean;
    carerId?: string | null;
}

export interface CarerNoteRecord {
    id: string;
    createdAt: Date | string;
    text: string;
    carerId: string;
    carerName?: string;
    patientId: string;
    logId?: string | null;
}

export interface CarerLogRecord {
    id: string;
    createdAt: Date | string;
    patientId: string;
    carerId: string;
    rawText: string;
    carerName?: string;
}