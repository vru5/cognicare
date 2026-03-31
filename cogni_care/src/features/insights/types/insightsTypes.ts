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


