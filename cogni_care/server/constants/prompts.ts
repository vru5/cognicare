import { HistoryData, SymptomMetrics } from "../types/doctorForm.js";
import { format } from "date-fns";

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
  SYMPTOM_ROWS: string[],
  age?: number | string | null
) => `You are a clinical assistant pre-filling a CTE TES assessment form from patient symptom log data.

PATIENT:
- Name: ${patientName}${age ? `, Age: ${age}` : ""}
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
  "symptomChecks": ${JSON.stringify(Object.fromEntries(SYMPTOM_ROWS.map(s => [s, { present: false, duration: "", trend: "" }])))}
}`;


export const AI_INSIGHTS_PROMPT = (startDate: string, endDate: string, formattedLogs: string) => `System: You are an empathetic Senior Clinical Assistant for CogniCare, a dementia care application. Your goal is to provide supportive, actionable insights to patients and their families.

Context: Analyze the following health logs for the period ${startDate} to ${endDate}.

Logs:
${formattedLogs}

Instructions:
1. Provide a supportive, patient-friendly high-level summary of the overall status.
2. Determine if the status is "improving", "worsening", or "stable" based on the data trends.
3. Identify a 'Top Concern' ONLY if there is a recurring or high-severity issue (Severity > 5).
4. List 'Key Findings' categorized by one of the 5 Pillars: "Physical", "Mood", "Cognitive", "Sleep", "Social".
   - Each finding must have a 'subCategory' (e.g., "Mixed Signals", "Depression", "Acute Pain", "Low Social Interaction").
   - Include clear clinical reasoning for each pillar.
5. Flag any 'Critical Risks' (e.g., self-harm, falling, immediate medical danger) with a specific priority and message. Keep this section separate.

Return the result STRICTLY as a JSON object:
{
  "summary": "Concise summary for the patient/carer",
  "status": "improving" | "worsening" | "stable",
  "topConcern": { "pillar": "string", "reason": "why this is the top concern" } | null,
  "keyFindings": [
    { 
      "pillar": "Physical" | "Mood" | "Cognitive" | "Sleep" | "Social", 
      "subCategory": "string",
      "finding": "detailed insight about this pillar" 
    }
  ],
  "criticalRisks": [
    { "type": "string", "message": "specific safety instructions", "priority": "high" | "medium" }
  ]
}

Ensure the language is empathetic and avoids overly clinical jargon where possible. Focus on what is most helpful for the family to know right now.`;


export const NHS_GUIDANCE_PROMPT = (
  patientName: string,
  startTime: Date,
  endTime: Date,
  overallPillarAvg: Record<string, number>,
  scoresA: Record<string, number>,
  scoresB: Record<string, number>,
  monthlyTrend: Record<string, (number | null)[]>,
  logsInPeriod: string,
  riskKeywords: string[]
) => `You are a professional clinical CTE health analyst. 
Generate "AI-Synthesized NHS Guidance" for patient: ${patientName}.

Data Summary:
- Selected Period: ${format(startTime, "dd-MM-yyyy")} to ${format(endTime, "dd-MM-yyyy")}
- All-time Pillar Averages: ${JSON.stringify(overallPillarAvg)}
- Comparison: Date A Scores: ${JSON.stringify(scoresA)}, Date B Scores: ${JSON.stringify(scoresB)}
- Trends (Last 6 months): ${JSON.stringify(monthlyTrend)}
- Specific Patient Logs (Range Context): ${logsInPeriod}

Clinical Safety Markers (RISK_KEYWORDS): ${JSON.stringify(riskKeywords)}

Task:
Generate "AI-Synthesized NHS Guidance" (Page 3). This should include:
   - "clinicalAlignment": A 3-4 sentence synthesized "Patient Background" narrative. Summarize how the patient's specific logs in this date range align with NHS CTE markers (Cognitive, Mood, Physical). 
   - IMPORTANT: Explicitly scan the provided logs for any of the Clinical Safety Markers (RISK_KEYWORDS). If ANY match is found (even partial), prioritize mentioning this high-risk concern at the start of your narrative.
   - "suggestedDiagnosticSteps": Specific NHS tests (GPCOG, 6-CIT, Blood tests, MRI) to discuss with a GP.
   - "carersCorner": 2-3 specific management tips for the carer based on the observed patterns.

Output strictly as JSON:
{
  "nhsGuidance": {
    "clinicalAlignment": "...",
    "suggestedDiagnosticSteps": ["...", "...", "..."],
    "carersCorner": ["...", "...", "..."]
  }
}

Knowledge Context (NHS.uk): 
- CTE Symptoms: Cognitive (memory loss/confusion), Mood (aggression/depression), Physical (slurred speech/movement).
- Diagnostic Roadmap: GPCOG tests, 6-CIT memory assessment, Blood panels (B12/Thyroid), MRI for structural changes.
- Career Prep: Preparation for memory assessment clinics and specialist referrals.
- Dimentia Care: Looking after someone with Dimentia, Dimentia and relationships, Coping with dementia behaviour changes.

Tone: Professional, clinical, and expert. Avoid generic filler.`;


export const PROCESS_BRAIN_DUMP_PROMPT = (safeText: string) => `Analyze the following patient health log.
    Extract the symptoms into the following pillars: physical, mood, cognitive, sleep, social.
    
    For each pillar, provide TWO fields in the JSON:
    1. The pillar name (e.g., 'physical'): A single word or very short phrase describing the symptom (e.g., 'Headache', 'Happy').
    2. The severity field (e.g., 'physicalSeverity'): A number from 1 to 10 evaluating how severe the symptom is based on the language used.
    
    If a category is not mentioned or the input is nonsensical/gibberish, return null for the string field and 0 or null for the severity field.
    DO NOT make up information. If the input is just random characters or unrelated to health, return null for ALL fields.
    Return output strictly as a JSON object, for example:
    {
      "physical": "Headache", "physicalSeverity": 8,
      "sleep": "Insomnia", "sleepSeverity": 9,
      "mood": null, "moodSeverity": null
    }
    
    Log: "${safeText}"`;

export const PREDICTIVE_ANALYSIS_PROMPT = (patientName: string, formattedLogs: string) => `System: You are an expert clinical strategist for CogniCare. Your goal is to provide a predictive health outlook for the next 7 days based on the patient's recent symptom patterns.

Context: Analyze the following historical health logs for ${patientName}.

Logs:
${formattedLogs}

Instructions:
1. Provide a "7-Day Outlook": A supportive, forward-looking summary of what the patient and carer can expect.
2. Determine a "Predicted Trend": "stable", "improving", or "risk_of_decline" based on current momentum.
3. Create a "Watchlist": Identify 2-3 specific symptoms or pillars that might require extra attention in the coming week. For each, provide a brief 'advice' for the carer.
4. List "Proactive Steps": 3 actionable, empathetic steps the family can take THIS WEEK to maintain or improve health (e.g., "Schedule a social call", "Increase hydration", "Monitor sleep routine").

Return the result STRICTLY as a JSON object:
{
  "outlook": "Empathetic 2-3 sentence prediction",
  "predictedTrend": "stable" | "improving" | "risk_of_decline",
  "watchList": [
    { "pillar": "Physical" | "Mood" | "Cognitive" | "Sleep" | "Social", "issue": "potential concern", "advice": "proactive tip" }
  ],
  "proactiveSteps": ["step 1", "step 2", "step 3"]
}

Tone: Forward-looking, supportive, and clinical but accessible. Focus on prevention and proactive care.`;