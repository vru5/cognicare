import { SymptomPillar } from "@/features/logs/types/logTypes";



export type DailyAverage = Record<SymptomPillar, number>;


export interface SymptomDataPoint {
  name: string;
  score: number;
}

export interface SymptomBarChartProps {
  data: SymptomDataPoint[];
  gradientId: string;
  gradientColors: { start: string; end: string };
  selectedSymptom: SymptomDataPoint | null;
  onSelectSymptom: (data: SymptomDataPoint) => void;
  accentColor: string;
}


export interface MajorSymptom {
  name: string;
  severity: number;
  pillar: string;
  lastSeen: string;
  source: 'patient' | 'carer';
}

export interface InsightAlert {
  type: string;
  message: string;
  date: string;
}

export interface MajorSymptomsResponse {
  topSymptoms: MajorSymptom[];
  alerts: InsightAlert[];
}

export interface EligibilityResponse {
  eligible: boolean;
  hasOneMonthData: boolean;
  days: number;
  joinedAt: string | Date;
}

export interface KeyFinding {
  pillar: string;
  subCategory: string;
  finding: string;
}

export interface AiInsightSummary {
  summary: string;
  status: "improving" | "worsening" | "stable";
  topConcern: {
    pillar: string;
    reason: string;
  } | null;
  keyFindings: KeyFinding[];
  criticalRisks: {
    type: string;
    message: string;
    priority: "high" | "medium";
  }[];
}

export interface MajorSymptomsCardProps {
  alerts: InsightAlert[];
  symptoms: MajorSymptom[];
  accentColor: string;
  onHelpClick?: () => void;
}

export interface AiInsightSectionProps {
  insights: AiInsightSummary;
  accentColor: string;
}

export interface SymptomDatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  accentColor: string;
}

export interface InsightsDashboardProps {
  patientId: string;
  accentColor: string;
}

export interface CalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "symptoms" | "average" | "predictive";
}



export interface WatchListEntry {
  pillar: string;
  issue: string;
  advice: string;
}

export interface PredictiveAnalysis {
  outlook: string;
  predictedTrend: "stable" | "improving" | "risk_of_decline";
  watchList: WatchListEntry[];
  proactiveSteps: string[];
}

export interface PredictiveAnalysisSectionProps {
  analysis: PredictiveAnalysis;
  accentColor: string;
}
