import { API_BASE_URL } from "@/constants/auth";
import { 
    DailyAverage, 
    MajorSymptomsResponse, 
    EligibilityResponse 
} from "../types/insightsTypes";

export async function getInsightsEligibility(patientId: string): Promise<EligibilityResponse | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/insights/eligibility?patientId=${patientId}`);
        const data = await response.json();
        
        if (!data.success) {
            console.error("Failed to fetch eligibility");
            return null;
        }
        
        // Handle both wrapped and unwrapped results for maximum resilience
        return data.data || (data.eligible !== undefined ? data : null);
    } catch (error) {
        console.error("Error fetching insights eligibility:", error);
        return null;
    }
}


export async function getSymptomAggregate(patientId: string, startDate: Date | string, endDate?: Date | string): Promise<DailyAverage | null> {
    try {
        const startString = startDate instanceof Date ? startDate.toISOString() : new Date(startDate).toISOString();
        let url = `${API_BASE_URL}/api/insights/daily?patientId=${patientId}&date=${startString}`;
        
        if (endDate) {
            const endString = endDate instanceof Date ? endDate.toISOString() : new Date(endDate).toISOString();
            url += `&endDate=${endString}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        if (!data.success) {
            console.error("Failed to fetch symptom aggregate");
            return null;
        }
        return data.data;
    } catch (error) {
        console.error("Error fetching symptom aggregate:", error);
        return null;
    }
}

export async function getMajorSymptoms(patientId: string): Promise<MajorSymptomsResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/insights/major-symptoms?patientId=${patientId}`);
        const data = await response.json();
        if (!data.success) {
            console.error("Failed to fetch major symptoms");
            return { topSymptoms: [], alerts: [] };
        }
        return data.data;
    } catch (error) {
        console.error("Error fetching major symptoms:", error);
        return { topSymptoms: [], alerts: [] };
    }
}
