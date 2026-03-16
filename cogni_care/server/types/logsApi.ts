export interface AppError {
    message: string;
    status?: number;
    code?: string;
};

export interface Analysis {
    physical?: string | null;
    mood?: string | null;
    cognitive?: string | null;
    sleep?: string | null;
    social?: string | null;
} 

export interface SymptomRecord extends Analysis {
    id: string;
    createdAt: Date | string;
    patientId: string;
    rawText: string;
    notes?: CarerNoteRecord[];
    comments?: CarerNoteRecord[];
}

export interface SymptomLogUpdateData extends Analysis {
    rawText?: string;
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