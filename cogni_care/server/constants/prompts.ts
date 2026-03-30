import { HistoryData, SymptomMetrics } from "../types/doctorForm.js";

export const HISTORY_GRADING_PROMPT = (history: HistoryData) => `You are a clinical neuro-specialist. Evaluate the following patient history responses for risk factors associated with Traumatic Encephalopathy Syndrome (TES).

HISTORY DATA:
- Stopped activities: ${history.stoppedChores || "None"}
- Drinking/Alcohol: ${history.drinking || "None"}
- Substances/Non-prescription: ${history.nonPrescription || "None"}
- Diet: ${history.diet || "None"}
- Family History: ${history.familyHistory || "None"}
- Support Network: ${history.supportNetwork || "None"}

TASK: 
1. Assign a severity/risk score from 0 to 15. 
2. IGNORE responses that clearly state "None", "No", "N/A", or "Denies". They should contribute 0 points.
3. WEIGH "Stopped activities" and "Alcohol/Substance" concerns more heavily.
4. Provide a very brief (1 sentence) clinical rationale.

RESPOND ONLY IN VALID JSON:
{ "historyScore": number, "rationale": "string" }`;

export const DOCTOR_FORM_PREFILL_PROMPT = (
  patientName: string,
  evaluationDate: string,
  monthsSinceFirst: number,
  firstLogDate: string,
  maskedLogsText: string,
  symptomMetrics: SymptomMetrics,
  SYMPTOM_ROWS: string[]
) => `You are a clinical assistant pre-filling a CTE TES assessment form from patient symptom log data.

PATIENT:
- Name: ${patientName}, Age: 47
- Evaluation date: ${evaluationDate}
- Months since first log: ${monthsSinceFirst} (first log: ${firstLogDate})
- Contact sports: 0 years, Concussions recorded: 0
- Recent logs (MASKED):
${maskedLogsText}
- Symptom scores (avg last month, 0-10):
${Object.entries(symptomMetrics).map(([k, v]) => `  ${k}: ${v.avgScore}/10, trend:${v.trend}, duration:${v.durationMonths}mo`).join("\n")}

RULES:
1. Only fill fields you can DIRECTLY infer. Leave all others as "" or false.
2. NEVER infer: military, biomarkers, imaging, family history, lifestyle, cte_likelihood.
3. rhi_sports6=true only if years>=6. rhi_concussions4=true only if concussions>=4.
4. core_cognitive=true if memory or focus >=6. core_mood=true if depression or anxiety >=6. core_behavioral=true if irritability >=7.
5. sup_anxiety if anxiety>=5. sup_apathy if apathy>=5. sup_headache if headache>=5. sup_impulsivity if irritability>=7. sup_decline if months>=12.
6. symptoms_12months: one factual sentence if months>=12, else "".
7. subtype: "Cognitive" if only cognitive; "Behavioral/Mood" if only mood/behavioral; "Mixed" if both; else "".
8. course: "Progressive" if 3+ symptoms getting_worse; "Stable" if none worsening; else "".
9. Symptom checklist: Set "present" to true if avgScore > 0. 
   CRITICAL: If "present" is true, YOU MUST also provide "duration" (exactly "recent" or "6months+") 
   and "trend" (exactly "improving", "staying_same", or "getting_worse"). 
   NEVER leave them empty if "present" is true.
10. Ensure the output is valid JSON.

Respond ONLY in valid JSON. Use this exact structure:
{
  "tes":{"name":"","evalDate":"","rhi_concussions4":false,"rhi_sports6":false,"rhi_military":false,"rhi_other":false,"rhi_notes":"","core_cognitive":false,"core_behavioral":false,"core_mood":false,"sup_decline":false,"sup_delayed":false,"sup_impulsivity":false,"sup_anxiety":false,"sup_apathy":false,"sup_paranoia":false,"sup_suicidality":false,"sup_headache":false,"sup_motor":false,"symptoms_12months":"","subtype":"","course":"","cte_likelihood":""},
  "symptomChecks": ${JSON.stringify(Object.fromEntries(SYMPTOM_ROWS.map(s => [s, { present: false, duration: "", trend: "" }] )))}
}`;

