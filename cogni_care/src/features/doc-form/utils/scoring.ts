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
  // Logic: Ignore "None", "No", "N/A" to avoid penalizing compulsory questions
  const isNegative = (val: any) => {
    if (typeof val !== 'string') return true;
    const v = val.trim().toLowerCase();
    return v === "" || v === "none" || v === "no" || v === "n/a" || v === "denies" || v === "null" || v === "nothing";
  };
  
  // Logic: Identify "Good/Healthy/Stable" status descriptions that shouldn't be scored as risks
  const isPositive = (val: any) => {
    if (typeof val !== 'string') return false;
    const v = val.trim().toLowerCase();
    return v.includes("good") || v.includes("healthy") || v.includes("balanced") || v.includes("normal") || v.includes("great") || v.includes("stable") || v.includes("strong");
  };

  let manualHistoryScore = 0;
  const historyFields = [
    { val: history.stoppedChores, weight: 2, type: 'risk' },
    { val: history.drinking, weight: 3, type: 'risk' },
    { val: history.nonPrescription, weight: 2, type: 'risk' },
    { val: history.diet, weight: 1, type: 'status' },
    { val: history.familyHistory, weight: 2, type: 'status' },
    { val: history.supportNetwork, weight: 1, type: 'status' },
    { val: history.additionalNotes, weight: 1, type: 'status' }
  ];

  historyFields.forEach(field => {
    const val = field.val?.trim() || "";
    if (isNegative(val)) return;

    if (field.type === 'risk') {
        // For risk fields, any non-negative answer that isn't empty is a concern
        manualHistoryScore += field.weight;
        if (val.length > 15) manualHistoryScore += 1;
    } else {
        // For status fields (Diet, Support), only score if it's NOT positive
        if (!isPositive(val)) {
            manualHistoryScore += field.weight;
            if (val.length > 15) manualHistoryScore += 1;
        }
    }
  });
  
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
