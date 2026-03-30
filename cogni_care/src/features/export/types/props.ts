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
    patientCount?: number;
    carerCount?: number;
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
  patientPillarLogs: Record<string, number>;
  carerPillarLogs: Record<string, number>;
}

export interface PillarRadarProps {
  scoresA: Record<string, number>;
  scoresB: Record<string, number>;
  patientScoresA?: Record<string, number>;
  carerScoresA?: Record<string, number>;
  patientScoresB?: Record<string, number>;
  carerScoresB?: Record<string, number>;
}

export interface SparkLineProps {
  trend: (number | null)[];
  patientTrend?: (number | null)[];
  carerTrend?: (number | null)[];
  color: string;
}

export interface ExportMenuProps {
  patientId: string;
  dateA: Date;
  dateB: Date;
  hasOneMonthData: boolean;
}
