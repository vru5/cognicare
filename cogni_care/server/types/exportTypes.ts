export interface AIInsight {
  pillar: string;
  icon: string;
  type: string;
  title: string;
  body: string;
}

export interface AIInsights {
  overallInsights: AIInsight[];
  comparisonInsights: AIInsight[];
  careTeamPoints: string[];
}

export interface PillarDiff {
  pillar: string;
  label: string;
  diff: number;
  scoreA: number;
  scoreB: number;
}

export interface ProfessionalReportResponse {
  success: boolean;
  data?: {
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
      biggestWorsening: PillarDiff;
      biggestImprovement: PillarDiff;
      mostStable: PillarDiff;
    };
    ai: AIInsights;
    summary: {
      diagnosisDate: string;
      totalLogs: number;
      highestBurden: { label: string; color: string };
      mostManaged: { label: string; color: string };
    };
  };
  error?: string;
}
