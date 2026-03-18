export interface Profile {
    name: string | null;
    email: string | null;
    phone: string | null;
    role: string | null;
    profileId: string | null;
}

export interface ProfileResponse {
    success: boolean;
    profile?: Profile;
    error?: string;
}

export interface CarerAccessInfo {
    id: string;
    name: string;
    email: string | null;
    accessSymptomLogs: boolean;
    accessCareCircle: boolean;
}

export interface CarersResponse {
    success: boolean;
    carers?: CarerAccessInfo[];
    error?: string;
}

export interface UpdateAccessResponse {
    success: boolean;
    error?: string;
}
