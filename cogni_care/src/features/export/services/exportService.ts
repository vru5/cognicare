import { API_BASE_URL } from "@/constants/auth";
import { ReportData } from "../types/report";
import { MajorSymptomsResponse } from "../../insights/types/insightsTypes";
import { DoctorFormData, HistoryData } from "../../doc-form/types/docForm";

export async function getProfessionalReportData(
  patientId: string,
  dateA: Date,
  dateB: Date,
  majorSymptoms?: MajorSymptomsResponse
): Promise<ReportData | null> {
  try {
    const dAStr = dateA.toISOString().split('T')[0];
    const dBStr = dateB.toISOString().split('T')[0];

    const response = await fetch(`${API_BASE_URL}/api/export/professional`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        dateA: dAStr,
        dateB: dBStr,
        majorSymptoms
      }),
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching report data:", error);
    return null;
  }
}
export async function getDoctorFormData(patientId: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/export/doctor-form?patientId=${patientId}`
    );
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching doctor form data:", error);
    return null;
  }
}

export async function updateDoctorFormData(patientId: string, data: Partial<DoctorFormData>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/export/doctor-form`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, data }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error updating doctor form data:", error);
    return false;
  }
}

export async function gradeHistoryRisk(history: HistoryData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/export/grade-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history }),
    });
    const result = await response.json();
    return result.success ? result : null;
  } catch (error) {
    console.error("Error grading history:", error);
    return null;
  }
}
