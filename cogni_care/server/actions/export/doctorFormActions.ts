import { prisma } from "../../lib/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mask } from "@yellowsakura/js-pii-mask";
import { AppError } from "server/types/logsApi.js";
import { format, differenceInMonths, differenceInDays } from "date-fns";
import crypto from "crypto";
import { HISTORY_GRADING_PROMPT, DOCTOR_FORM_PREFILL_PROMPT } from "../../constants/prompts.js";
import { 
    DoctorFormData, 
    DoctorFormResponse, 
    SymptomMetrics, 
    SymptomMetric,
    SymptomCheck,
    SYMPTOM_ROWS,
    TesData
} from "../../types/doctorForm.js";
import { HistoryData } from "../../../src/features/doc-form/types/docForm.js"; // HistoryData is complex, importing from src for now as it's purely types

export async function generateDoctorFormDataAction(
  patientId: string
): Promise<DoctorFormResponse> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    // 1. Fetch Patient Info
    const patientProfile = await prisma.profilePatient.findUnique({
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
    const cached = await prisma.doctorFormCache.findUnique({
        where: { patientId }
    });

    if (cached && cached.hash === currentHash) {
      const cachedData = cached.data as unknown as DoctorFormData;
      console.log(`[DoctorForm] DB Cache HIT for ${patientId}. Keys:`, Object.keys(cachedData));
      const hitData: DoctorFormResponse = {
        success: true,
        data: {
            ...cachedData,
            tes: {
                ...(cachedData.tes || {}),
                name: cachedData.tes?.name || patientName // Safety re-inject
            },
            patientDetails: {
                ...cachedData.patientDetails,
                evaluationDate: format(new Date(), "dd/MM/yyyy") // Always use current eval date
            }
        }
      };
      return hitData;
    }
    console.log(`[DoctorForm] DB Cache MISS for ${patientId} (New data or expired)`);

    // 3. Process Averages and Trends
    const symptomMetrics: SymptomMetrics = {
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



    // Calculate actual data based on the pillars (simplified approximation)
    // For a real app, you would parse the rawText to find specific symptoms,
    // but here we map pillars to key symptoms as best approximation.
    const getAvg = (logs: { physicalSeverity: number | null, moodSeverity: number | null, cognitiveSeverity: number | null, sleepSeverity: number | null, socialSeverity: number | null }[], field: string) => {
        const vals = logs.map(l => (l as any)[field] as number).filter(v => v > 0);
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

    const prompt = DOCTOR_FORM_PREFILL_PROMPT(
        patientName,
        format(new Date(), "dd/MM/yyyy"),
        monthsSinceFirst,
        format(diagnosisDate, "dd MMM yyyy"),
        maskedLogsText,
        symptomMetrics,
        SYMPTOM_ROWS
    );

    // 5. Query Gemini
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedData: { tes: Partial<TesData>, symptomChecks: Record<string, SymptomCheck> } = { tes: {}, symptomChecks: {} };
    try {
        parsedData = JSON.parse(responseText);
        
        // Post-process to ensure duration/trend are never empty if present is true
        if (parsedData.symptomChecks) {
            Object.entries(parsedData.symptomChecks).forEach(([_, val]) => {
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

    const finalResult: DoctorFormResponse = {
      success: true,
      data: {
        ...parsedData,
        tes: {
          ...(parsedData.tes || {}),
          name: parsedData.tes?.name || patientName // Ensure name is always filled
        } as TesData,
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

    try {
        await prisma.doctorFormCache.upsert({
            where: { patientId },
            update: { hash: currentHash, data: finalResult.data as any },
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
    data: DoctorFormData
): Promise<{ success: boolean; error?: string }> {
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
        await prisma.doctorFormCache.upsert({
            where: { patientId },
            update: { hash: currentHash, data: data as any },
            create: { patientId, hash: currentHash, data: data as any }
        });

        console.log(`[DoctorForm] Cache UPDATED manually for ${patientId}`);
        return { success: true };
    } catch (err: unknown) {
        console.error("Doctor Form Cache Update Error:", err);
        return { success: false, error: "Failed to update cache" };
    }
}

export async function gradeHistoryRiskAction(
    history: HistoryData
): Promise<{ success: boolean; historyScore: number; rationale: string }> {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) return { success: false, historyScore: 0, rationale: "API Key missing" };
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = HISTORY_GRADING_PROMPT(history);

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(responseText);
        return { 
            success: true, 
            historyScore: Math.min(Math.max(parsed.historyScore || 0, 0), 15), 
            rationale: parsed.rationale || "" 
        };
    } catch (err) {
        console.error("Grade History Error:", err);
        return { success: false, historyScore: 0, rationale: "AI evaluation failed" };
    }
}
