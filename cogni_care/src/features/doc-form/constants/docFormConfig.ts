import { TesData, HistoryData } from "../types/docForm";

export const SECTIONS = [
  { id: "symptoms", icon: "✅", label: "Symptoms" },
  { id: "history", icon: "📝", label: "History" },
  { id: "tes", icon: "📋", label: "TES Score" },
  { id: "concerns", icon: "🏥", label: "Concerns" },
  { id: "summary", icon: "📊", label: "Summary" },
];

export const SYMPTOM_ROWS = [
  "Quick Temper, Anger, Irritability",
  "Physical & Verbal Outbursts",
  "Impulsivity, Lack of Self Control",
  "Inappropriate Behavior, Aggressiveness",
  "Addictive Behavior",
  "Memory Problems",
  "Poor Judgment",
  "Trouble Concentrating & Learning",
  "Difficulty Following Verbal Exchanges",
  "Trouble Prioritizing, Planning & Organizing",
  "Difficulty Putting Ideas on Paper",
  "Difficulty Reading",
  "Deficient Handwriting",
  "Depression, Feeling Hopeless, Helpless",
  "Anxiety, Feeling of Doom",
  "Lack of Motivation, Initiative",
  "Feeling Worthless, Low Self Esteem",
  "Reclusiveness",
  "Suicidal Thoughts",
  "Paranoia",
  "Apathy, Lack of Empathy",
  "Trouble Sleeping",
  "Frequent Headaches",
  "Unexplained Localized Pain",
  "Muscle Spasms",
  "Slurred Speech",
  "Ringing in Ears",
  "Sensitivity to Light",
  "Sensitivity to Noise",
  "Balance and Vertigo Issues",
  "Brain Fog",
  "Extreme Fatigue",
  "Short Term Memory Loss",
  "Explosive Anger",
  "Extreme Depression",
  "Noise Sensitivity",
  "Light Sensitivity",
  "Loss in Vision Focus",
  "Dark Thoughts",
  "Loss of Sense of Time",
];

export const PILLARS = ["physical", "cognitive", "mood", "sleep", "social"];

export const PILLAR_META = {
  physical: { label: "Physical", color: "#ef4444", bg: "#fef2f2" },
  cognitive: { label: "Cognitive", color: "#3b82f6", bg: "#eff6ff" },
  mood: { label: "Mood", color: "#a855f7", bg: "#f3e8ff" },
  sleep: { label: "Sleep", color: "#6366f1", bg: "#eef2ff" },
  social: { label: "Social", color: "#22c55e", bg: "#f0fdf4" }
} as Record<string, { label: string, color: string, bg: string }>;

export const SYMPTOM_LIST = SYMPTOM_ROWS.map(sym => {
  let pillar = "physical";
  if (["Trouble Sleeping"].includes(sym)) pillar = "sleep";
  else if (["Quick Temper, Anger, Irritability", "Depression, Feeling Hopeless, Helpless", "Anxiety, Feeling of Doom", "Feeling Worthless, Low Self Esteem", "Suicidal Thoughts", "Explosive Anger", "Extreme Depression", "Dark Thoughts"].includes(sym)) pillar = "mood";
  else if (["Memory Problems", "Poor Judgment", "Trouble Concentrating & Learning", "Difficulty Following Verbal Exchanges", "Trouble Prioritizing, Planning & Organizing", "Difficulty Putting Ideas on Paper", "Difficulty Reading", "Deficient Handwriting", "Brain Fog", "Short Term Memory Loss", "Loss of Sense of Time"].includes(sym)) pillar = "cognitive";
  else if (["Impulsivity, Lack of Self Control", "Inappropriate Behavior, Aggressiveness", "Addictive Behavior", "Lack of Motivation, Initiative", "Reclusiveness", "Paranoia", "Apathy, Lack of Empathy", "Physical & Verbal Outbursts"].includes(sym)) pillar = "social";
  return { key: sym, label: sym, pillar };
});

export const CONCERN_ITEMS = [
  "Loud noises, heavy music, chaos, or crowded waiting areas are very disturbing",
  "Bright lights are very disturbing and cause headaches",
  "I may not be able to endure a long visit and may need to split my exam",
  "If I am alone I will need help reading text and filling out forms",
  "Every now and then I feel confused — please explain all procedures and write them down",
  "Please include me in decision making and understand I may need encouragement and follow up",
];

export const DEFAULT_TES: TesData = {
  name: "", age: "", consultant: "", evalDate: "",
  rhi_concussions4: false, rhi_moderate2: false, rhi_sports6: false, rhi_military: false, rhi_other: false, rhi_notes: "",
  core_cognitive: false, core_behavioral: false, core_mood: false,
  sup_decline: false, sup_delayed: false, sup_impulsivity: false, sup_anxiety: false,
  sup_apathy: false, sup_paranoia: false, sup_suicidality: false, sup_headache: false, sup_motor: false,
  symptoms_12months: "", subtype: "", course: "", cte_likelihood: "",
  motor_dysarthria: false, motor_dysgraphia: false, motor_brady: false, motor_tremor: false,
  motor_rigidity: false, motor_gait: false, motor_falls: false,
};

export const DEFAULT_HISTORY: HistoryData = {
  stoppedChores: "", drinking: "", nonPrescription: "", diet: "", 
  familyHistory: "", supportNetwork: "", additionalNotes: "" 
};

// ── PDF Report Constants ──

export const GAUGE_CONFIG = {
  CX: 120, CY: 120, R: 100, IR: 68
};

export const GAUGE_SEGMENTS = [
  { min: 0, max: 20, c: "#2e8b6e", lbl: "Low" },
  { min: 20, max: 45, c: "#3d6b8f", lbl: "Mild" },
  { min: 45, max: 75, c: "#e8a838", lbl: "Moderate" },
  { min: 75, max: 100, c: "#c0674a", lbl: "High" },
];
