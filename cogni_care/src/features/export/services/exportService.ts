import { API_BASE_URL } from "@/constants/auth";
import { ReportData } from "../types/report";

export async function getProfessionalReportData(
  patientId: string,
  dateA: Date,
  dateB: Date
): Promise<ReportData | null> {
  try {
    const dAStr = dateA.toISOString().split('T')[0];
    const dBStr = dateB.toISOString().split('T')[0];

    const response = await fetch(
      `${API_BASE_URL}/api/export/professional?patientId=${patientId}&dateA=${dAStr}&dateB=${dBStr}`
    );
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
