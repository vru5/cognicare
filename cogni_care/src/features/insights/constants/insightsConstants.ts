export const PILLAR_COLORS: Record<string, string> = {
  Physical: "#ef4444",
  Mood: "#a855f7",
  Cognitive: "#3b82f6",
  Sleep: "#6366f1",
  Social: "#22c55e",
};

export const SYMPTOM_FULL_NAMES: Record<string, string> = {
  physical: "Physical",
  mood: "Mood",
  cognitive: "Cognitive",
  sleep: "Sleep",
  social: "Social",
};

export const SYMPTOM_EMOJIS: Record<string, string> = {
  physical: "🤕 Phy",
  mood: "😊 Mod",
  cognitive: "🧠 Cog",
  sleep: "😴 Slp",
  social: "💬 Soc",
};



export const getSymptomEmoji = (pillar: string) => SYMPTOM_EMOJIS[pillar.toLowerCase()] || pillar;
export const getPillarColor = (pillarName: string) => {
  const normalized = pillarName.charAt(0).toUpperCase() + pillarName.slice(1).toLowerCase();
  if (normalized.includes("Mood")) return PILLAR_COLORS.Mood;
  return PILLAR_COLORS[normalized] || "#888";
};

// UI Strings
export const INSIGHTS_TITLE = "Insights";
export const INSIGHTS_LOCKED_TITLE = "Insights Locked";
export const INSIGHTS_LOCKED_DESCRIPTION = "Log your symptoms for 7 distinct days to unlock comparative analytics.";
export const PROGRESS_LABEL = "Progress";
export const PROGRESS_DAYS_FOOTER = (remaining: number) => `${remaining} more days to go!`;

export const HEALTH_REPORT_TITLE = "Health Report";
export const SYMPTOM_COMPARISON_SUBTITLE = "Select Range";

export const TAP_BAR_DETAILS = "Tap a bar to see details";
export const NO_DATA_RECORD_DATE = "No data recorded for this period";

export const DATE_PRESETS = [
  { label: "Today", key: "day" as const },
  { label: "7 Days", key: "7d" as const },
  { label: "15 Days", key: "15d" as const },
  { label: "1 Month", key: "1m" as const },
  { label: "3 Months", key: "3m" as const },
  { label: "6 Months", key: "6m" as const },
  { label: "Custom", key: "custom" as const },
];

export const PATIENT_RECORDS_TITLE = "Patient Records";
export const SELECT_PATIENT_SUBTITLE = "Select a patient to view their comparative health insights.";
export const NO_PATIENTS_FOUND = "No patients found";

export const SYMPTOM_BAR_CHART_CONFIG = {
  score: { label: "Score" },
};
