import { ReportData, BaseReportPageProps } from "./report";
import { MajorSymptomsResponse } from "../../insights/types/insightsTypes";

export interface SummaryPageProps extends BaseReportPageProps {
  data: ReportData;
}

export interface AIInsightsPageProps extends BaseReportPageProps {
  patient: ReportData["patient"];
  ai: ReportData["ai"];
  summary: ReportData["summary"];
  period: ReportData["period"];
  isContinuation?: boolean;
}

export interface ComparisonPageProps {
  data: ReportData;
}

export interface CarePlanPageProps {
  data: ReportData;
}

export interface MemoPageProps extends BaseReportPageProps {
  data: ReportData;
}

export interface NhsGuidancePageProps extends BaseReportPageProps {
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
    sub?: string;
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
  startDate: Date;
  endDate: Date;
  joinedAt: Date;
  accentColor: string;
  majorSymptoms?: MajorSymptomsResponse;
  hasDataInRange?: boolean;
  hasOneMonthData?: boolean;
}
