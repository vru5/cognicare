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
    patientPillarAvg: Record<string, number>;
    carerPillarAvg: Record<string, number>;
    patientPillarLogs: Record<string, number>;
    carerPillarLogs: Record<string, number>;
    monthlyTrend: Record<string, (number | null)[]>;
    patientMonthlyTrend: Record<string, (number | null)[]>;
    carerMonthlyTrend: Record<string, (number | null)[]>;
    patientMonthlyLogs: Record<string, (number | null)[]>;
    carerMonthlyLogs: Record<string, (number | null)[]>;
    months: string[];
  };
  comparison: {
    scoresA: Record<string, number>;
    scoresB: Record<string, number>;
    patientScoresA: Record<string, number>;
    carerScoresA: Record<string, number>;
    patientScoresB: Record<string, number>;
    carerScoresB: Record<string, number>;
    patientPillarLogsA: Record<string, number>;
    carerPillarLogsA: Record<string, number>;
    patientPillarLogsB: Record<string, number>;
    carerPillarLogsB: Record<string, number>;
    totalA: number;
    totalB: number;
    overallChange: number;
    logsCountA: number;
    logsCountB: number;
    patientLogsA: number;
    carerLogsA: number;
    patientLogsB: number;
    carerLogsB: number;
    biggestWorsening: { pillar: string; label: string; diff: number; scoreA: number; scoreB: number };
    biggestImprovement: { pillar: string; label: string; diff: number; scoreA: number; scoreB: number };
    mostStable: { pillar: string; label: string; diff: number; scoreA: number; scoreB: number };
  };
  ai: {
    overallInsights: AIInsight[];
    comparisonInsights: Array<AIInsight & { color?: string; bg?: string }>;
    careTeamPoints: string[];
  };
  summary: {
    diagnosisDate: string;
    totalLogs: number;
    patientLogsCount: number;
    carerLogsCount: number;
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
