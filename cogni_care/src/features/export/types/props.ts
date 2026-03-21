import { ReportData } from "./report";

export interface SummaryPageProps {
  data: ReportData;
}

export interface AIInsightsPageProps {
  patient: ReportData["patient"];
  ai: ReportData["ai"];
  summary: ReportData["summary"];
}

export interface ComparisonPageProps {
  data: ReportData;
}

export interface CarePlanPageProps {
  data: ReportData;
}

export interface MemoPageProps {
  data: ReportData;
}

export interface ReportHeaderProps {
  title: string;
  subtitle: string;
  patient: ReportData["patient"];
  summary: ReportData["summary"];
  periodInfo?: {
    label: string;
    value: string;
    sub: string;
  };
}

export interface PageShellProps {
  children: React.ReactNode;
  pageNum: number;
  totalPages: number;
  patientName: string;
  patientId: string;
}

export interface DoughnutChartProps {
  averages: Record<string, number>;
}

export interface PillarRadarProps {
  scoresA: Record<string, number>;
  scoresB: Record<string, number>;
}

export interface SparkLineProps {
  trend: (number | null)[];
  color: string;
}

export interface ExportMenuProps {
  patientId: string;
  dateA: Date;
  dateB: Date;
}
