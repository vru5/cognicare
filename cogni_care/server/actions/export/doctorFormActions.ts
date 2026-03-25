import { prisma } from "../../lib/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { AppError } from "server/types/logsApi.js";
import { format, differenceInMonths, differenceInDays } from "date-fns";
import crypto from "crypto";

export async function generateDoctorFormDataAction(
  patientId: string
): Promise<any> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    // 1. Fetch Patient Info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patientProfile = await (prisma as any).profilePatient.findUnique({
      where: { id: patientId },
      include: { 
        user: true,
        carers: {
          include: {
            carer: {
              include: { user: true }
            }
          }
        }
      },
    });

    if (!patientProfile) {
      throw new Error(`Patient profile not found for ID: ${patientId}`);
    }

    const patientName = patientProfile.user.name || "Patient";
    const diagnosisDate = new Date(patientProfile.createdAt);
    const monthsSinceFirst = differenceInMonths(new Date(), diagnosisDate);

    // 2. Fetch All Logs for the Patient
    const allLogs = await prisma.symptomLog.findMany({
      where: { patientId },
      select: {
        physicalSeverity: true,
        moodSeverity: true,
        cognitiveSeverity: true,
        sleepSeverity: true,
        socialSeverity: true,
        rawText: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2.1 Calculate Data Hash to check for changes
    const logsContent = JSON.stringify(allLogs.map(l => ({ 
        p: l.physicalSeverity, m: l.moodSeverity, c: l.cognitiveSeverity, 
        s: l.sleepSeverity, so: l.socialSeverity, t: l.rawText 
    })));
    const currentHash = crypto.createHash("md5").update(logsContent).digest("hex");

    // 2.2 Check Persistent DB Cache
    const cached = await (prisma as any).doctorFormCache.findUnique({
        where: { patientId }
    });

    if (cached && cached.hash === currentHash) {
      console.log(`[DoctorForm] DB Cache HIT for ${patientId}. Keys:`, Object.keys(cached.data as any));
      const hitData = {
        success: true,
        data: {
            ...(cached.data as any),
            tes: {
                ...((cached.data as any).tes || {}),
                name: (cached.data as any).tes?.name || patientName // Safety re-inject
            },
            patientDetails: {
                ...(cached.data as any).patientDetails,
                evaluationDate: format(new Date(), "dd/MM/yyyy") // Always use current eval date
            }
        }
      };
      return hitData;
    }
    console.log(`[DoctorForm] DB Cache MISS for ${patientId} (New data or expired)`);

    // 3. Process Averages and Trends
    const symptomMetrics = {
      irritability: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
      depression: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
      anxiety: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
      apathy: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
      headache: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
      pain: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
      nausea: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
      memory: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
      focus: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
      confusion: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
      withdrawal: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
      insomnia: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
      fatigue: { avgScore: 0, trend: "staying_same", durationMonths: 0 },
    };

    const SYMPTOM_ROWS = [
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

    // Calculate actual data based on the pillars (simplified approximation)
    // For a real app, you would parse the rawText to find specific symptoms,
    // but here we map pillars to key symptoms as best approximation.
    const getAvg = (logs: any[], field: string) => {
        const vals = logs.map(l => l[field] as number).filter(v => v > 0);
        return vals.length > 0 ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
    };

    const latestDate = allLogs.length > 0 ? new Date(allLogs[0].createdAt) : new Date();
    const recentLogs = allLogs.filter(l => differenceInDays(latestDate, new Date(l.createdAt)) <= 30);
    const oldLogs = allLogs.filter(l => differenceInDays(latestDate, new Date(l.createdAt)) > 30);

    const calcTrend = (recent: number, old: number) => {
        if (recent > old + 1) return "getting_worse";
        if (recent < old - 1) return "improving";
        return "staying_same";
    };

    // Mapping pillars to specific symptoms as an approximation 
    symptomMetrics.depression.avgScore = getAvg(recentLogs, 'moodSeverity');
    symptomMetrics.depression.trend = calcTrend(symptomMetrics.depression.avgScore, getAvg(oldLogs, 'moodSeverity'));
    symptomMetrics.depression.durationMonths = monthsSinceFirst;

    symptomMetrics.anxiety.avgScore = getAvg(recentLogs, 'moodSeverity');
    symptomMetrics.anxiety.trend = calcTrend(symptomMetrics.anxiety.avgScore, getAvg(oldLogs, 'moodSeverity'));
    symptomMetrics.anxiety.durationMonths = monthsSinceFirst;

    symptomMetrics.memory.avgScore = getAvg(recentLogs, 'cognitiveSeverity');
    symptomMetrics.memory.trend = calcTrend(symptomMetrics.memory.avgScore, getAvg(oldLogs, 'cognitiveSeverity'));
    symptomMetrics.memory.durationMonths = monthsSinceFirst;

    symptomMetrics.focus.avgScore = getAvg(recentLogs, 'cognitiveSeverity');
    symptomMetrics.focus.trend = symptomMetrics.memory.trend;
    symptomMetrics.focus.durationMonths = monthsSinceFirst;

    symptomMetrics.insomnia.avgScore = getAvg(recentLogs, 'sleepSeverity');
    symptomMetrics.insomnia.trend = calcTrend(symptomMetrics.insomnia.avgScore, getAvg(oldLogs, 'sleepSeverity'));
    symptomMetrics.insomnia.durationMonths = monthsSinceFirst;
    
    symptomMetrics.fatigue.avgScore = getAvg(recentLogs, 'physicalSeverity');
    symptomMetrics.fatigue.trend = calcTrend(symptomMetrics.fatigue.avgScore, getAvg(oldLogs, 'physicalSeverity'));
    symptomMetrics.fatigue.durationMonths = monthsSinceFirst;

    symptomMetrics.withdrawal.avgScore = getAvg(recentLogs, 'socialSeverity');
    symptomMetrics.withdrawal.trend = calcTrend(symptomMetrics.withdrawal.avgScore, getAvg(oldLogs, 'socialSeverity'));
    symptomMetrics.withdrawal.durationMonths = monthsSinceFirst;

    symptomMetrics.headache.avgScore = getAvg(recentLogs, 'physicalSeverity');
    symptomMetrics.headache.trend = symptomMetrics.fatigue.trend;
    symptomMetrics.headache.durationMonths = monthsSinceFirst;
    
    symptomMetrics.irritability.avgScore = getAvg(recentLogs, 'moodSeverity');
    symptomMetrics.irritability.trend = symptomMetrics.depression.trend;
    symptomMetrics.irritability.durationMonths = monthsSinceFirst;

    // 4. Construct Prompt
    const maskedLogsText = allLogs.slice(0, 10).map(l => `[${format(new Date(l.createdAt), "dd/MM/yyyy")}]: ${mask(l.rawText || "")}`).join("\n");

    const prompt = `You are a clinical assistant pre-filling a CTE TES assessment form from patient symptom log data.

PATIENT:
- Name: ${mask(patientName)}, Age: 47
- Evaluation date: ${format(new Date(), "dd/MM/yyyy")}
- Months since first log: ${monthsSinceFirst} (first log: ${format(diagnosisDate, "dd MMM yyyy")})
- Contact sports: 0 years, Concussions recorded: 0
- Recent logs (MASKED):
${maskedLogsText}
- Symptom scores (avg last month, 0-10):
${Object.entries(symptomMetrics).map(([k,v])=>`  ${k}: ${v.avgScore}/10, trend:${v.trend}, duration:${v.durationMonths}mo`).join("\n")}

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
  "symptomChecks": ${JSON.stringify(Object.fromEntries(SYMPTOM_ROWS.map(s => [s, {present:false, duration:"", trend:""}])))}
}`;

    // 5. Query Gemini
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedData: any = {};
    try {
        parsedData = JSON.parse(responseText);
        
        // Post-process to ensure duration/trend are never empty if present is true
        if (parsedData.symptomChecks) {
            Object.entries(parsedData.symptomChecks).forEach(([sym, val]: [string, any]) => {
                if (val.present) {
                    if (!val.duration || val.duration === "") val.duration = "recent";
                    if (!val.trend || val.trend === "") val.trend = "staying_same";
                    
                    // Map to booleans for the UI state
                    val.recent = val.duration === "recent";
                    val.sixMonths = val.duration === "6months+";
                    val.improving = val.trend === "improving";
                    val.same = val.trend === "staying_same";
                    val.worse = val.trend === "getting_worse";
                }
            });
        }
    } catch (e) {
        console.error("Failed to parse Gemini JSON:", responseText);
        throw new Error("Invalid output from AI model");
    }

    const finalResult = {
      success: true,
      data: {
        ...parsedData,
        tes: {
          ...((parsedData as any).tes || {}),
          name: (parsedData as any).tes?.name || patientName // Ensure name is always filled
        },
        patientDetails: {
          name: patientName,
          consultant: patientProfile.carers?.[0]?.carer?.user?.name || "",
          age: "", // Age is not in current schema, user will fill in form
          evaluationDate: format(new Date(), "dd/MM/yyyy"),
          monthsSinceFirst,
          firstLogDate: format(diagnosisDate, "dd MMM yyyy")
        }
      }
    };

    // 6. Persist to DB cache
    try {
        await (prisma as any).doctorFormCache.upsert({
            where: { patientId },
            update: { hash: currentHash, data: finalResult.data },
            create: { patientId, hash: currentHash, data: finalResult.data as any }
        });
        console.log(`[DoctorForm] Cache SAVED for ${patientId}`);
    } catch (cacheErr) {
        console.warn(`[DoctorForm] Cache SAVE failed (non-critical):`, cacheErr);
    }

    return finalResult;
  } catch (err: unknown) {
    const error = err as AppError;
    console.error("Doctor Form Generation Error:", error);
    return { success: false, error: error.message || "Failed to generate doctor form data" };
  }
}

export async function updateDoctorFormCacheAction(
    patientId: string,
    data: any
): Promise<any> {
    try {
        // 1. Fetch Logs to calculate the current hash
        // We use the same hash logic as the generator to ensure consistency
        const allLogs = await prisma.symptomLog.findMany({
            where: { patientId },
            select: {
              physicalSeverity: true,
              moodSeverity: true,
              cognitiveSeverity: true,
              sleepSeverity: true,
              socialSeverity: true,
              rawText: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        const logsContent = JSON.stringify(allLogs.map(l => ({ 
            p: l.physicalSeverity, m: l.moodSeverity, c: l.cognitiveSeverity, 
            s: l.sleepSeverity, so: l.socialSeverity, t: l.rawText 
        })));
        const currentHash = crypto.createHash("md5").update(logsContent).digest("hex");

        // 2. Persist the manual override to the DB cache
        // Note: The 'data' passed here should match the structure { tes, symptomChecks, patientDetails }
        await (prisma as any).doctorFormCache.upsert({
            where: { patientId },
            update: { hash: currentHash, data },
            create: { patientId, hash: currentHash, data: data as any }
        });

        console.log(`[DoctorForm] Cache UPDATED manually for ${patientId}`);
        return { success: true };
    } catch (err: unknown) {
        console.error("Doctor Form Cache Update Error:", err);
        return { success: false, error: "Failed to update cache" };
    }
}
