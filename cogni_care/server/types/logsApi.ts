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
    rawText: string;
    comments?: CarerCommentRecord[];
}

export interface SymptomLogUpdateData extends Analysis {
    rawText?: string;
}

export interface CarerCommentRecord {
    id: string;
    createdAt: Date | string;
    text: string;
    carerId: string;
    carerName?: string;
}

export interface CarerLogRecord {
    id: string;
    createdAt: Date | string;
    patientId: string;
    carerId: string;
    rawText: string;
    carerName?: string;
}