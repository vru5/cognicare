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

export interface HistoryData {
  stoppedChores: string;
  drinking: string;
  nonPrescription: string;
  diet: string;
  familyHistory: string;
  supportNetwork: string;
  additionalNotes?: string;
}

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

export interface PatientDetails {
  id: string;
  name: string;
  age?: string | number;
  consultant?: string;
  evaluationDate?: string;
  monthsSinceFirst?: number;
}

export interface DoctorFormData {
  patientDetails: PatientDetails;
  tes: TesData;
  symptomChecks: Record<string, SymptomCheck>;
}

// ── Component Prop Interfaces ──

export interface SymptomsSectionProps {
  tes: TesData;
  updateTes: (k: string, v: any) => void;
  aiFilledKeys: Set<any>;
  symptomChecks: Record<string, SymptomCheck>;
  toggleSymptomPresent: (sym: string) => void;
  setSymptomChecks: React.Dispatch<React.SetStateAction<Record<string, SymptomCheck>>>;
  expandedSymptom: string | null;
  setExpandedSymptom: (s: string | null) => void;
  showErrors?: boolean;
}

export interface HistorySectionProps {
  history: HistoryData;
  updateHistory: (k: keyof HistoryData, v: string) => void;
  showErrors?: boolean;
}

export interface TesSectionProps {
  tes: TesData;
  updateTes: (k: string, v: any) => void;
  aiFilledKeys: Set<any>;
  showErrors?: boolean;
}

export interface ConcernsSectionProps {
  concerns: Record<number, boolean>;
  toggleConcern: (k: number) => void;
  showErrors?: boolean;
}

export interface SeverityMeterProps {
  tes: TesData;
  symptomChecks: Record<string, SymptomCheck>;
  history: HistoryData;
}

export interface DocFormHeaderProps {
  title: string;
  patient: any;
}

export interface PdfPageShellProps {
  children: any; // Using any for ReactNode to avoid react import in types file
  pageNum: number;
  totalPages: number;
  patient: any;
}

export interface PdfCheckMarkProps {
  checked: boolean;
}

export interface PdfTrendBadgeProps {
  trend: string;
}

export interface PdfDurationBadgeProps {
  duration: "recent" | "6months+";
}
