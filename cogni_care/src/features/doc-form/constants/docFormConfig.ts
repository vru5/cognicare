import { TesData, HistoryData } from "../types/docForm";
import { DOC_FORM_STRINGS } from "./docStrings";

export const SECTIONS = [
  { id: "symptoms", icon: "✅", label: "Symptoms" },
  { id: "history", icon: "📝", label: "History" },
  { id: "tes", icon: "📋", label: "TES Score" },
  { id: "concerns", icon: "🏥", label: "Concerns" },
  { id: "summary", icon: "📊", label: "Summary" },
];



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

export const SEVERITY_LEVELS = [
  { 
    id: "low", 
    label: DOC_FORM_STRINGS.SUMMARY.LEVEL_INSUFFICIENT, 
    color: "#51947b", 
    bg: "#f8f6f1",
    textColorClass: "text-[#51947b]", 
    minScore: 0, 
    urgency: DOC_FORM_STRINGS.SUMMARY.URGENCY_INSUFFICIENT 
  },
  { 
    id: "mild", 
    label: DOC_FORM_STRINGS.SUMMARY.LEVEL_MILD, 
    color: "#3d6b8f", 
    bg: "#eef4f9",
    textColorClass: "text-[#3d6b8f]", 
    minScore: 25, 
    urgency: DOC_FORM_STRINGS.SUMMARY.URGENCY_MILD 
  },
  { 
    id: "moderate", 
    label: DOC_FORM_STRINGS.SUMMARY.LEVEL_MODERATE, 
    color: "#e8a838", 
    bg: "#fdf6e7",
    textColorClass: "text-[#e8a838]", 
    minScore: 50, 
    urgency: DOC_FORM_STRINGS.SUMMARY.URGENCY_MODERATE 
  },
  { 
    id: "high", 
    label: DOC_FORM_STRINGS.SUMMARY.LEVEL_HIGH, 
    color: "#c0674a", 
    bg: "#fdf1ed",
    textColorClass: "text-[#c0674a]", 
    minScore: 75, 
    urgency: DOC_FORM_STRINGS.SUMMARY.URGENCY_HIGH 
  },
];

export const HISTORY_FIELDS: { key: keyof HistoryData; label: string }[] = [
  { key: "stoppedChores", label: "Have you stopped chores/activities you used to do due to memory or thinking?" },
  { key: "drinking", label: "Have you ever had drinking problems?" },
  { key: "nonPrescription", label: "Are you taking any non prescription drugs?" },
  { key: "diet", label: "What is your diet like?" },
  { key: "familyHistory", label: "Is there family history of dementia or other neurological diseases (Alzheimer's, ALS, Parkinson's disease)?" },
  { key: "supportNetwork", label: "What is your support network like?" },
  { key: "additionalNotes", label: "Additional notes (Optional)" },
];

export const SYMPTOM_DURATIONS = {
  RECENT: "recent",
  SIX_MONTHS_PLUS: "6months+"
};

export const RHI_CRITERIA: { key: keyof TesData; label: string }[] = [
  { key: "rhi_concussions4", label: "≥4 concussions or mild TBIs" },
  { key: "rhi_moderate2", label: "≥2 moderate/severe TBIs" },
  { key: "rhi_sports6", label: "≥6 years contact sports" },
  { key: "rhi_military", label: "Military with combat exposure" },
  { key: "rhi_other", label: "Other significant RHI" }
];

export const CORE_FEATURES: { key: keyof TesData; label: string }[] = [
  { key: "core_cognitive", label: "Cognitive impairment" },
  { key: "core_behavioral", label: "Behavioral — explosive/violent" },
  { key: "core_mood", label: "Mood — depressed/hopeless" }
];

export const SUPPORTIVE_FEATURES: { key: keyof TesData; label: string }[] = [
  { key: "sup_decline", label: "Documented decline" },
  { key: "sup_delayed", label: "Delayed onset" },
  { key: "sup_impulsivity", label: "Impulsivity" },
  { key: "sup_anxiety", label: "Anxiety" },
  { key: "sup_apathy", label: "Apathy" },
  { key: "sup_paranoia", label: "Paranoia" },
  { key: "sup_suicidality", label: "Suicidality" },
  { key: "sup_headache", label: "Headache" },
  { key: "sup_motor", label: "Motor impairment" }
];

export const DIAGNOSTIC_SUBTYPES = ["Cognitive", "Behavioral/Mood", "Mixed", "Dementia"];
export const CLINICAL_COURSES = ["Stable", "Progressive", "Unknown/Inconsistent"];
export const CTE_LIKELIHOODS = ["Probable CTE", "Possible CTE", "Unlikely CTE"];

export const MOTOR_FEATURES: { key: keyof TesData; label: string }[] = [
  { key: "motor_dysarthria", label: "Dysarthria" },
  { key: "motor_dysgraphia", label: "Dysgraphia" },
  { key: "motor_brady", label: "Bradykinesia" },
  { key: "motor_tremor", label: "Tremor" },
  { key: "motor_rigidity", label: "Rigidity" },
  { key: "motor_gait", label: "Gait change" },
  { key: "motor_falls", label: "Falls / parkinsonism" }
];

export const PATIENT_INFO_FIELDS: { key: keyof TesData; label: string; placeholder: string }[] = [
  { key: "name", label: DOC_FORM_STRINGS.PATIENT_INFO.LABEL_NAME, placeholder: DOC_FORM_STRINGS.PATIENT_INFO.PLACEHOLDER_NAME },
  { key: "age", label: DOC_FORM_STRINGS.PATIENT_INFO.LABEL_AGE, placeholder: DOC_FORM_STRINGS.PATIENT_INFO.PLACEHOLDER_AGE },
  { key: "consultant", label: DOC_FORM_STRINGS.PATIENT_INFO.LABEL_CONSULTANT, placeholder: DOC_FORM_STRINGS.PATIENT_INFO.PLACEHOLDER_CONSULTANT },
  { key: "evalDate", label: DOC_FORM_STRINGS.PATIENT_INFO.LABEL_EVAL_DATE, placeholder: DOC_FORM_STRINGS.PATIENT_INFO.PLACEHOLDER_EVAL_DATE },
];

