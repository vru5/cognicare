export interface Profile {
  name: string | null;
  email: string | null;
  phone: string | null;
  role: "PATIENT" | "CARER" | null;
  profileId: string | null;
}

export interface CarerAccess {
  id: string;
  name: string;
  email: string | null;
  accessSymptomLogs: boolean;
  accessCareCircle: boolean;
}

export interface SettingsResponse {
    success: boolean;
    error?: string;
}

export interface ProfileResponse extends SettingsResponse {
    profile?: Profile;
}

export interface CarersResponse extends SettingsResponse {
    carers?: CarerAccess[];
}
