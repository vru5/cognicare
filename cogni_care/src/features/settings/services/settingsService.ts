import { API_BASE_URL } from "@/constants/auth";

export async function getPatientCarers(patientProfileId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/carers?patientProfileId=${patientProfileId}`);
        return await response.json();
    } catch (err) {
        console.error("Failed to fetch carers:", err);
        return { success: false, error: "Failed to fetch carers" };
    }
}

export async function updateCarerAccess(patientProfileId: string, carerProfileId: string, data: { accessSymptomLogs?: boolean; accessCareCircle?: boolean }) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/carers`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientProfileId, carerProfileId, data }),
        });
        return await response.json();
    } catch (err) {
        console.error("Failed to update carer access:", err);
        return { success: false, error: "Failed to update access" };
    }
}

export async function getFullProfile(userId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/profile?userId=${userId}`);
        return await response.json();
    } catch (err) {
        console.error("Failed to fetch profile:", err);
        return { success: false, error: "Failed to load profile" };
    }
}
