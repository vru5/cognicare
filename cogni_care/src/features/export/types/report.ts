export interface AIInsight {
  pillar: string;
  icon: string;
  type: string;
  title: string;
  body: string;
}

export interface ProcessedInsight extends AIInsight {
  color: string;
  borderColor: string;
  isLast: boolean;
}

export interface ReportData {
  patient: {
    name: string;
    id: string;
    diagnosisDate: string;
    age?: number;
  };
  period: {
    dateA: string;
    dateB: string;
    entries: number;
  };
  overall: {
    pillarAvg: Record<string, number>;
    monthlyTrend: Record<string, (number | null)[]>;
    months: string[];
  };
  comparison: {
    scoresA: Record<string, number>;
    scoresB: Record<string, number>;
    totalA: number;
    totalB: number;
    overallChange: number;
    logsCountA: number;
    logsCountB: number;
    biggestWorsening: { pillar: string; label: string; diff: number; scoreA: number; scoreB: number };
    biggestImprovement: { pillar: string; label: string; diff: number; scoreA: number; scoreB: number };
    mostStable: { pillar: string; label: string; diff: number; scoreA: number; scoreB: number };
  };
  ai: {
    overallInsights: AIInsight[];
    comparisonInsights: Array<AIInsight & { color?: string }>;
    careTeamPoints: string[];
  };
  summary: {
    diagnosisDate: string;
    totalLogs: number;
    highestBurden: { label: string; color: string };
    mostManaged: { label: string; color: string };
  };
}

export interface PillarConfig {
  key: string;
  label: string;
  icon: string;
  color: string;
}
