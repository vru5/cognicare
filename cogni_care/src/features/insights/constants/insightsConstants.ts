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

// Clinical Calculation Tooltips & Explanations (for CalculationModal)
export const CALCULATION_TEXT = {
  SYMPTOMS: {
    TITLE: "Major Symptoms Analysis",
    SUBTITLE: "Transparent breakdown of our clinical analysis metrics.",
    LOGIC_INTRO: "To keep the dashboard focused on what matters most, we analyze the last 7 days of logs using these three rules:",
    RULES: [
      {
        id: 1,
        title: "We take the \"Peak\" (Highest Score)",
        desc: "If a symptom is logged multiple times, we only show the highest severity it reached. We don't average these; we want you to see the worst point of the week."
      },
      {
        id: 2,
        title: "The \"Risk Level\" Rule",
        desc: "Any log containing a Critical Risk (like explosive anger, suicidal thoughts, or sudden motor decline) is automatically set to Level 10. This ensures high-risk neurological events always appear at the top."
      },
      {
        id: 3,
        title: "Top 5 Selection",
        desc: "We show the 5 symptoms that either hit a Risk Level or had the highest peak severity during the week."
      }
    ],
    EXAMPLE: {
      TITLE: "Concrete Example",
      SYMPTOM: "Anxiety",
      LOGS: "Level 2, Level 5, Level 3",
      RESULT_LABEL: "Displays as",
      RESULT_VALUE: "LVL 5"
    }
  },
  AVERAGE: {
    TITLE: "Combined Average Logic",
    LOGIC: "This chart displays the mathematical mean (average) of severity scores for each of the 5 monitoring pillars.",
    FORMULA: "Average = (Sum of Severities) / (Total Number of Logs)",
    FOOTER: "If multiple logs exist for a single day, they are all included in the average calculation to capture the full daily variance and identify patterns over your selected date range."
  }
};

export const SEVERITY_LEGEND = [
  { label: "LVL 0", desc: "None", colorClass: "border-slate-200 text-slate-400" },
  { label: "LVL 1-5", desc: "Mild/Mod", colorClass: "border-blue-200 text-blue-400" },
  { label: "LVL 6-10", desc: "Severe", colorClass: "border-primary/30 text-primary" }
];
