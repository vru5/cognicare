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