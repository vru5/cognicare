import { Analysis } from "./logsApi.js";

export interface TesData {
  name: string;
  age: string;
  consultant: string;
  evalDate: string;
  rhi_concussions4: boolean;
  rhi_moderate2: boolean;
  rhi_sports6: boolean;
  rhi_military: boolean;
  rhi_other: boolean;
  rhi_notes: string;
  core_cognitive: boolean;
  core_behavioral: boolean;
  core_mood: boolean;
  sup_decline: boolean;
  sup_delayed: boolean;
  sup_impulsivity: boolean;
  sup_anxiety: boolean;
  sup_apathy: boolean;
  sup_paranoia: boolean;
  sup_suicidality: boolean;
  sup_headache: boolean;
  sup_motor: boolean;
  symptoms_12months: string;
  subtype: string;
  course: string;
  cte_likelihood: string;
  motor_dysarthria: boolean;
  motor_dysgraphia: boolean;
  motor_brady: boolean;
  motor_tremor: boolean;
  motor_rigidity: boolean;
  motor_gait: boolean;
  motor_falls: boolean;
}

export interface SymptomCheck {
  present: boolean;
  recent?: boolean;
  sixMonths?: boolean;
  improving?: boolean;
  same?: boolean;
  worse?: boolean;
  duration?: string;
  trend?: string;
}

export interface PatientDetails {
  name: string;
  consultant: string;
  age: string | number;
  evaluationDate: string;
  monthsSinceFirst: number;
  firstLogDate?: string;
}

export interface HistoryData {
  stoppedChores: string;
  drinking: string;
  nonPrescription: string;
  diet: string;
  familyHistory: string;
  supportNetwork: string;
  additionalNotes?: string;
}

export interface DoctorFormData {
  patientDetails: PatientDetails;
  tes: TesData;
  symptomChecks: Record<string, SymptomCheck>;
}

export interface DoctorFormResponse {
  success: boolean;
  data?: DoctorFormData;
  error?: string;
}

export interface SymptomMetric {
  avgScore: number;
  trend: "getting_worse" | "improving" | "staying_same";
  durationMonths: number;
}

export interface SymptomMetrics {
  irritability: SymptomMetric;
  depression: SymptomMetric;
  anxiety: SymptomMetric;
  apathy: SymptomMetric;
  headache: SymptomMetric;
  pain: SymptomMetric;
  nausea: SymptomMetric;
  memory: SymptomMetric;
  focus: SymptomMetric;
  confusion: SymptomMetric;
  withdrawal: SymptomMetric;
  insomnia: SymptomMetric;
  fatigue: SymptomMetric;
}

export const SYMPTOM_ROWS = [
  "Quick Temper, Anger, Irritability", "Physical & Verbal Outbursts", "Impulsivity, Lack of Self Control",
  "Inappropriate Behavior, Aggressiveness", "Addictive Behavior", "Memory Problems", "Poor Judgment",
  "Trouble Concentrating & Learning", "Difficulty Following Verbal Exchanges", "Trouble Prioritizing, Planning & Organizing",
  "Difficulty Putting Ideas on Paper", "Difficulty Reading", "Deficient Handwriting", "Depression, Feeling Hopeless, Helpless",
  "Anxiety, Feeling of Doom", "Lack of Motivation, Initiative", "Feeling Worthless, Low Self Esteem", "Reclusiveness",
  "Suicidal Thoughts", "Paranoia", "Apathy, Lack of Empathy", "Trouble Sleeping", "Frequent Headaches",
  "Unexplained Localized Pain", "Muscle Spasms", "Slurred Speech", "Ringing in Ears", "Sensitivity to Light",
  "Sensitivity to Noise", "Balance and Vertigo Issues", "Brain Fog", "Extreme Fatigue", "Short Term Memory Loss",
  "Explosive Anger", "Extreme Depression", "Noise Sensitivity", "Light Sensitivity", "Loss in Vision Focus",
  "Dark Thoughts", "Loss of Sense of Time",
];
