import { HistoryData, SymptomCheck, TesData, SeverityScores, PatientDetails } from "./docForm";
import { ReactNode } from "react";

export interface DocFormHeaderProps {
  title: string;
  patient: PatientDetails;
}

export interface PdfPageShellProps {
  children: ReactNode;
  pageNum: number;
  totalPages: number;
  patient: PatientDetails;
}

export interface PdfCheckMarkProps {
  checked: boolean;
}

export interface PdfTrendBadgeProps {
  trend: string;
}

export interface PdfDurationBadgeProps {
  duration: "recent" | "6months+";
}

// ── PDF Page Component Props ──

export interface SymptomPart1PageProps {
  patient: PatientDetails;
  mergedPatient: PatientDetails;
  totalPages: number;
  pageNum: number;
  symptoms: Record<string, SymptomCheck>;
  presentCount: number;
}

export interface SymptomPart2PageProps {
  patient: PatientDetails;
  mergedPatient: PatientDetails;
  totalPages: number;
  pageNum: number;
  symptoms: Record<string, SymptomCheck>;
}

export interface PatientHistoryPageProps {
  patient: PatientDetails;
  mergedPatient: PatientDetails;
  totalPages: number;
  pageNum: number;
  history: HistoryData;
}

export interface TesCriteriaPageProps {
  patient: PatientDetails;
  mergedPatient: PatientDetails;
  totalPages: number;
  pageNum: number;
  tes: TesData;
}

export interface SummaryConcernsPageProps {
  patient: PatientDetails;
  mergedPatient: PatientDetails;
  totalPages: number;
  pageNum: number;
  scoreData: SeverityScores;
  concerns: Record<number, boolean>;
  aiHistoryGrade: number | null;
}

export interface DocFormPDFData {
  patient: PatientDetails;
  tes: TesData;
  symptoms: Record<string, SymptomCheck>;
  history: HistoryData;
  concerns: Record<number, boolean>;
  aiHistoryGrade: number | null;
}
