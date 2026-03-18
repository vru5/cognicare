export interface CarerPatient {
    id: string;
    name: string;
    hasNewLog: boolean;
    accessSymptomLogs: boolean;
}

export interface CarerPatientsResponse {
    success: boolean;
    patients?: CarerPatient[];
    error?: string;
}

export interface ActionResponse {
    success: boolean;
    error?: string;
}
