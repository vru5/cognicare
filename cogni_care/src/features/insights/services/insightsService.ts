import { API_BASE_URL } from "@/constants/auth";
import { PieChartData, DailyAverage, MajorSymptomsData } from "../types/insightsTypes";

export async function getInsightsEligibility(patientId: string): Promise<{ eligible: boolean, hasOneMonthData: boolean, days: number, joinedAt: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/insights/eligibility?patientId=${patientId}`);
        const data = await response.json();
        if (!data.success) {
            console.error("Failed to fetch eligibility");
            return { eligible: false, hasOneMonthData: false, days: 0, joinedAt: new Date().toISOString() };
        }
        return { eligible: data.eligible, hasOneMonthData: !!data.hasOneMonthData, days: data.days, joinedAt: data.joinedAt };
    } catch (error) {
        console.error("Error fetching insights insights eligibility:", error);
        return { eligible: false, hasOneMonthData: false, days: 0, joinedAt: new Date().toISOString() };
    }
}

export async function getAllTimeLogAggregates(patientId: string): Promise<PieChartData> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/insights/aggregates?patientId=${patientId}`);
        const data = await response.json();
        if (!data.success) {
            console.error("Failed to fetch log aggregates");
            return [];
        }
        return data.data;
    } catch (error) {
        console.error("Error fetching log aggregates:", error);
        return [];
    }
}

export async function getDailyAverage(patientId: string, date: Date | string): Promise<DailyAverage | null> {
    try {
        // Handle dates accurately across timezones when passing as string
        const dateString = date instanceof Date ? date.toISOString() : new Date(date).toISOString();
        const response = await fetch(`${API_BASE_URL}/api/insights/daily?patientId=${patientId}&date=${dateString}`);
        const data = await response.json();
        if (!data.success) {
            console.error("Failed to fetch daily average");
            return null;
        }
        return data.data;
    } catch (error) {
        console.error("Error fetching daily average:", error);
        return null;
    }
}

export async function getMajorSymptoms(patientId: string): Promise<MajorSymptomsData> {
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
