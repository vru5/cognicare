import { TesData, SymptomCheck, HistoryData, SeverityScores } from "../types/docForm";

export const calculateSeverityScore = (
  symptomChecks: Record<string, SymptomCheck>,
  history: HistoryData,
  tes: TesData,
  aiHistoryGrade?: number | null
): SeverityScores => {
  // 1. Symptom Burden (Max 30)
  const symptomList = Object.values(symptomChecks);
  const presentCount = symptomList.filter((s) => s.present).length;
  const worseCount = symptomList.filter((s) => s.worse).length;
  const improvingCount = symptomList.filter((s) => s.improving).length;
  
  const symptomScore = Math.min(
    Math.round(presentCount * 0.9 + worseCount * 2 - improvingCount * 0.5),
    30
  );

  // 2. Patient History (Max 15)
  let manualHistoryScore = 0;
  const historyFields = [
    history.stoppedChores,
    history.drinking,
    history.nonPrescription,
    history.diet,
    history.familyHistory,
    history.supportNetwork,
    history.additionalNotes
  ];
  
  const filledHistoryCount = historyFields.filter(
    (v) => typeof v === "string" && v.trim().length > 0
  ).length;

  manualHistoryScore += Math.min(filledHistoryCount * 2, 8);
  if (history.drinking?.trim().length > 2) manualHistoryScore += 3;
  if (history.nonPrescription?.trim().length > 2) manualHistoryScore += 2;
  if (history.stoppedChores?.trim().length > 2) manualHistoryScore += 2;
  
  manualHistoryScore = Math.min(Math.round(manualHistoryScore), 15);
  
  // Use AI grade if available, otherwise manual fallback
  const finalHistoryScore = (aiHistoryGrade !== null && aiHistoryGrade !== undefined) 
    ? aiHistoryGrade 
    : manualHistoryScore;

  // 3. TES Criteria (Max 55)
  const rhiMet = [
    tes.rhi_concussions4,
    tes.rhi_moderate2,
    tes.rhi_sports6,
    tes.rhi_military,
    tes.rhi_other
  ].filter(Boolean).length;

  const coreMet = [
    tes.core_cognitive,
    tes.core_behavioral,
    tes.core_mood
  ].filter(Boolean).length;

  const supMet = [
    tes.sup_decline,
    tes.sup_delayed,
    tes.sup_impulsivity,
    tes.sup_anxiety,
    tes.sup_apathy,
    tes.sup_paranoia,
    tes.sup_suicidality,
    tes.sup_headache,
    tes.sup_motor
  ].filter(Boolean).length;

  const tesScore = Math.min(
    Math.round(
      rhiMet * 5 + 
      coreMet * 9 + 
      Math.min(supMet * 4, 20) + 
      (tes.symptoms_12months ? 8 : 0)
    ),
    55
  );

  // 4. Total Calculation
  const total = Math.min(symptomScore + finalHistoryScore + tesScore, 100);

  return {
    total,
    symptomScore,
    historyScore: finalHistoryScore,
    tesScore,
    presentCount,
    worseCount,
    improvingCount,
    rhiMet,
    coreMet,
    supMet
  };
};
