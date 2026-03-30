import { SymptomPillar } from "@/features/logs/types/logTypes";

export type PieChartData = { name: string; value: number; fill: string }[];

export type DailyAverage = Record<SymptomPillar, number>;

export interface BreakdownTableProps {
  dateA: Date;
  dateB: Date;
  dataA: DailyAverage | null;
  dataB: DailyAverage | null;
}

export interface ComparisonCardsProps {
  dateA: Date;
  dateB: Date;
  joinedAt: Date;
  onChangeDateA: (date: Date) => void;
  onChangeDateB: (date: Date) => void;
  dataA: DailyAverage | null;
  dataB: DailyAverage | null;
  loading: boolean;
}

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

export interface TopPieChartProps {
  data: PieChartData;
}
