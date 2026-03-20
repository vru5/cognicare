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

export const BREAKDOWN_EMOJIS: Record<string, string> = {
  physical: "🤕",
  mood: "😊",
  cognitive: "🧠",
  sleep: "😴",
  social: "💬",
  default: "📌",
};

export const getSymptomEmoji = (pillar: string) => SYMPTOM_EMOJIS[pillar.toLowerCase()] || pillar;
export const getBreakdownEmoji = (pillar: string) => BREAKDOWN_EMOJIS[pillar.toLowerCase()] || BREAKDOWN_EMOJIS.default;
export const getSymptomFullName = (pillar: string) => SYMPTOM_FULL_NAMES[pillar.toLowerCase()] || pillar;
export const getPillarColor = (pillarName: string) => PILLAR_COLORS[pillarName] || "#888";

// UI Strings
export const INSIGHTS_TITLE = "Insights";
export const INSIGHTS_LOCKED_TITLE = "Insights Locked";
export const INSIGHTS_LOCKED_DESCRIPTION = "Log your symptoms for 7 distinct days to unlock comparative analytics.";
export const PROGRESS_LABEL = "Progress";
export const PROGRESS_DAYS_FOOTER = (remaining: number) => `${remaining} more days to go!`;

export const COMPARE_DAYS_TITLE = "Compare\ntwo days";
export const SYMPTOM_COMPARISON_SUBTITLE = "Symptom Comparison";

export const DATE_PRESETS = [
  { label: "Yesterday vs Today", key: "1" as const },
  { label: "7 days apart",       key: "7" as const },
  { label: "14 days apart",      key: "14" as const },
];

export const WELLNESS_TITLE = "Wellness";
export const FIVE_PILLARS_SUBTITLE = "5 Pillars";
export const NO_WELLNESS_DATA = "No Wellness Data";
export const LOG_SYMPTOMS_PROMPT = "Log symptoms to see your breakdown";
export const TAP_SLICE_DETAILS = "Tap a slice to see details";

export const BREAKDOWN_TITLE = "Breakdown";
export const TAP_BAR_DETAILS = "Tap a bar to see details";
export const NO_DATA_RECORD_DATE = "No data recorded for this date";

export const PATIENT_RECORDS_TITLE = "Patient Records";
export const SELECT_PATIENT_SUBTITLE = "Select a patient to view their comparative health insights.";
export const NO_PATIENTS_FOUND = "No patients found";

export const VS_TEXT = "VS";

export const SYMPTOM_BAR_CHART_CONFIG = {
  score: { label: "Score" },
};
