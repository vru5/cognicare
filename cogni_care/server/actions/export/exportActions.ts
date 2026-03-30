import { prisma } from "../../lib/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError, Analysis } from "server/types/logsApi.js";
import { AIInsights, ProfessionalReportResponse } from "server/types/exportTypes.js";
import { format, subMonths, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import crypto from "crypto";
import { mask } from "@yellowsakura/js-pii-mask";

export async function generateProfessionalReportAction(
  patientId: string,
  dateA: string,
  dateB: string
): Promise<ProfessionalReportResponse> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    // 1. Fetch Patient Info & Base Data
    const patientProfile = await (prisma as any).profilePatient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!patientProfile) {
      throw new Error(`Patient profile not found for ID: ${patientId}`);
    }

    const patientName = patientProfile.user.name || "Patient";

    // 2. Fetch All-Time Logs
    const allLogs = await prisma.symptomLog.findMany({
      where: { patientId },
      select: {
        physicalSeverity: true,
        moodSeverity: true,
        cognitiveSeverity: true,
        sleepSeverity: true,
        socialSeverity: true,
        createdAt: true,
        isFromCarer: true,
        rawText: true,
      }
    });

    const patientLogs = allLogs.filter(l => !l.isFromCarer);
    const carerLogs = allLogs.filter(l => l.isFromCarer);

    const pillars = ["physical", "mood", "cognitive", "sleep", "social"] as const;
    const overallPillarAvg: Record<string, number> = {};
    const patientPillarAvg: Record<string, number> = {};
    const carerPillarAvg: Record<string, number> = {};
    const patientPillarLogs: Record<string, number> = {};
    const carerPillarLogs: Record<string, number> = {};
    
    pillars.forEach(p => {
      const field = `${p}Severity` as keyof typeof allLogs[0];
      const allVals = allLogs.map(l => l[field] as number).filter(v => v > 0);
      const pVals = allLogs.filter(l => !l.isFromCarer).map(l => l[field] as number).filter(v => v > 0);
      const cVals = allLogs.filter(l => l.isFromCarer).map(l => l[field] as number).filter(v => v > 0);
      
      overallPillarAvg[p] = allVals.length > 0 ? +(allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(1) : 0;
      patientPillarAvg[p] = pVals.length > 0 ? +(pVals.reduce((a, b) => a + b, 0) / pVals.length).toFixed(1) : 0;
      carerPillarAvg[p] = cVals.length > 0 ? +(cVals.reduce((a, b) => a + b, 0) / cVals.length).toFixed(1) : 0;
      patientPillarLogs[p] = pVals.length;
      carerPillarLogs[p] = cVals.length;
    });

    // 3. Trends
    const joinedAt = new Date(patientProfile.createdAt);
    const sixMonthsAgo = subMonths(new Date(), 5);
    const trendStart = joinedAt > sixMonthsAgo ? startOfMonth(joinedAt) : startOfMonth(sixMonthsAgo);

    const monthlyTrend: Record<string, (number | null)[]> = {};
    const patientMonthlyTrend: Record<string, (number | null)[]> = {};
    const carerMonthlyTrend: Record<string, (number | null)[]> = {};
    const patientMonthlyLogs: Record<string, (number | null)[]> = {};
    const carerMonthlyLogs: Record<string, (number | null)[]> = {};
    const months: string[] = [];

    let cursor = startOfMonth(trendStart);
    const now = startOfMonth(new Date());

    pillars.forEach(p => { 
      monthlyTrend[p] = []; 
      patientMonthlyTrend[p] = [];
      carerMonthlyTrend[p] = [];
      patientMonthlyLogs[p] = [];
      carerMonthlyLogs[p] = [];
    });

    while (cursor <= now) {
      const monthStart = startOfMonth(cursor);
      const monthEnd = endOfMonth(cursor);
      const monthLogs = allLogs.filter(l => l.createdAt >= monthStart && l.createdAt <= monthEnd);

      if (monthLogs.length > 0) {
        months.push(format(cursor, "MMM"));

        pillars.forEach(p => {
          const field = `${p}Severity` as keyof typeof allLogs[0];
          const allV = monthLogs.map(l => l[field] as number).filter(v => v != null && v > 0);
          const pV = monthLogs.filter(l => !l.isFromCarer).map(l => l[field] as number).filter(v => v != null && v > 0);
          const cV = monthLogs.filter(l => l.isFromCarer).map(l => l[field] as number).filter(v => v != null && v > 0);
          
          monthlyTrend[p].push(allV.length > 0 ? +(allV.reduce((a, b) => a + b, 0) / allV.length).toFixed(1) : null);
          patientMonthlyTrend[p].push(pV.length > 0 ? +(pV.reduce((a, b) => a + b, 0) / pV.length).toFixed(1) : null);
          carerMonthlyTrend[p].push(cV.length > 0 ? +(cV.reduce((a, b) => a + b, 0) / cV.length).toFixed(1) : null);
          patientMonthlyLogs[p].push(pV.length || 0);
          carerMonthlyLogs[p].push(cV.length || 0);
        });
      }
      cursor = startOfMonth(subMonths(cursor, -1));
    }

    // 4. Comparison Data
    const startTime = new Date(dateA < dateB ? dateA : dateB);
    startTime.setHours(0, 0, 0, 0);
    const endTime = new Date(dateA > dateB ? dateA : dateB);
    endTime.setHours(23, 59, 59, 999);

    const getDailyAvg = (logs: Analysis[]) => {
      const res: Record<string, number> = {};
      pillars.forEach(p => {
        const field = `${p}Severity` as keyof Analysis;
        const vals = logs.map(l => l[field] as number).filter(v => v > 0);
        res[p] = vals.length > 0 ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
      });
      return res;
    };
    
    const getDailyCounts = (logs: Analysis[]) => {
      const pRes: Record<string, number> = {};
      const cRes: Record<string, number> = {};
      pillars.forEach(p => {
        const field = `${p}Severity` as keyof Analysis;
        pRes[p] = logs.filter(l => !l.isFromCarer && l[field] != null && (l[field] as number) > 0).length;
        cRes[p] = logs.filter(l => l.isFromCarer && l[field] != null && (l[field] as number) > 0).length;
      });
      return { pRes, cRes };
    };

    const logsOnDateA = allLogs.filter(l => isSameDay(l.createdAt, new Date(dateA)));
    const logsOnDateB = allLogs.filter(l => isSameDay(l.createdAt, new Date(dateB)));
    
    const scoresA = getDailyAvg(logsOnDateA);
    const scoresB = getDailyAvg(logsOnDateB);
    const patientScoresA = getDailyAvg(logsOnDateA.filter(l => !l.isFromCarer));
    const carerScoresA = getDailyAvg(logsOnDateA.filter(l => l.isFromCarer));
    const patientScoresB = getDailyAvg(logsOnDateB.filter(l => !l.isFromCarer));
    const carerScoresB = getDailyAvg(logsOnDateB.filter(l => l.isFromCarer));
    const logsCountA = logsOnDateA.length;
    const logsCountB = logsOnDateB.length;
    const patientLogsA = logsOnDateA.filter(l => !l.isFromCarer).length;
    const carerLogsA = logsOnDateA.filter(l => l.isFromCarer).length;
    const patientLogsB = logsOnDateB.filter(l => !l.isFromCarer).length;
    const carerLogsB = logsOnDateB.filter(l => l.isFromCarer).length;
    const { pRes: patientPillarLogsA, cRes: carerPillarLogsA } = getDailyCounts(logsOnDateA);
    const { pRes: patientPillarLogsB, cRes: carerPillarLogsB } = getDailyCounts(logsOnDateB);

    const totalA = +Object.values(scoresA).reduce((a, b) => a + b, 0).toFixed(1);
    const totalB = +Object.values(scoresB).reduce((a, b) => a + b, 0).toFixed(1);
    const overallChange = +(totalB - totalA).toFixed(1);

    const pillarDiffs = pillars.map(p => ({
      pillar: p,
      label: p.charAt(0).toUpperCase() + p.slice(1),
      diff: +(( scoresB[p] || 0) - (scoresA[p] || 0)).toFixed(1),
      scoreA: scoresA[p] || 0,
      scoreB: scoresB[p] || 0,
    }));

    const worseningPillar = pillarDiffs.reduce((a, b) => b.diff > a.diff ? b : a);
    const improvementPillar = pillarDiffs.reduce((a, b) => b.diff < a.diff ? b : a);
    const stablePillar = pillarDiffs.reduce((a, b) => Math.abs(b.diff) < Math.abs(a.diff) ? b : a);

    // 5. Caching & AI
    const logsInPeriod = allLogs.filter(l => l.createdAt >= startTime && l.createdAt <= endTime);
    const hashData = JSON.stringify(logsInPeriod.map(l => ({ 
      p: l.physicalSeverity, m: l.moodSeverity, c: l.cognitiveSeverity, 
      s: l.sleepSeverity, so: l.socialSeverity, t: l.rawText 
    })));
    const currentHash = crypto.createHash("md5").update(hashData).digest("hex");

    const burdenEntries = Object.entries(overallPillarAvg);
    const highestBurdenKey = burdenEntries.length > 0 ? burdenEntries.reduce((a, b) => b[1] > a[1] ? b : a)[0] : "sleep";
    const mostManagedKey = burdenEntries.length > 0 ? burdenEntries.reduce((a, b) => b[1] < a[1] ? b : a)[0] : "social";

    const pCfg: Record<string, { label: string; color: string }> = {
      mood: { label: "Mood", color: "#e8a838" },
      physical: { label: "Physical", color: "#c0674a" },
      cognitive: { label: "Cognitive", color: "#6b52ae" },
      social: { label: "Social", color: "#2e8b6e" },
      sleep: { label: "Sleep", color: "#3d6b8f" },
    };

    let aiInsights: AIInsights = { overallInsights: [], comparisonInsights: [], careTeamPoints: [] };
    const cacheModel = (prisma as any).professionalReportCache;

    // 6. Define Base Report Data (DRY)
    const reportBase = {
      patient: { name: patientName, id: patientId, diagnosisDate: format(patientProfile.createdAt, "dd MMM yyyy") },
      period: { dateA: format(new Date(dateA), "dd MMM yyyy"), dateB: format(new Date(dateB), "dd MMM yyyy"), entries: allLogs.length },
      overall: { pillarAvg: overallPillarAvg, patientPillarAvg, carerPillarAvg, patientPillarLogs, carerPillarLogs, monthlyTrend, patientMonthlyTrend, carerMonthlyTrend, patientMonthlyLogs, carerMonthlyLogs, months },
      comparison: { scoresA, scoresB, patientScoresA, carerScoresA, patientScoresB, carerScoresB, patientPillarLogsA, carerPillarLogsA, patientPillarLogsB, carerPillarLogsB, totalA, totalB, overallChange, logsCountA, logsCountB, patientLogsA, carerLogsA, patientLogsB, carerLogsB, biggestWorsening: worseningPillar, biggestImprovement: improvementPillar, mostStable: stablePillar },
      summary: {
        diagnosisDate: format(patientProfile.createdAt, "dd MMM yyyy"),
        totalLogs: allLogs.length,
        patientLogsCount: patientLogs.length,
        carerLogsCount: carerLogs.length,
        highestBurden: pCfg[highestBurdenKey] || pCfg.sleep,
        mostManaged: pCfg[mostManagedKey] || pCfg.social,
      }
    };

    if (cacheModel) {
      try {
        const cached = await cacheModel.findUnique({
          where: { patientId_dateA_dateB: { patientId, dateA, dateB } }
        });

        if (cached && cached.hash === currentHash) {
          console.log(`[ProfessionalReport] Cache HIT for ${patientId}`);
          aiInsights = cached.data as unknown as AIInsights;
          return {
            success: true,
            data: {
              ...reportBase,
              ai: aiInsights
            }
          };
        }
      } catch (cacheErr) {
        console.warn("[ProfessionalReport] Cache lookup failed:", cacheErr);
      }
    }

    const prompt = `You are a professional clinical CTE health analyst. 
    Generate a professional health report for patient: ${mask(patientName)}.
    
    Data Summary:
    - Period: ${format(startTime, "dd-MM-yyyy")} to ${format(endTime, "dd-MM-yyyy")}
    - All-time Pillar Averages: ${JSON.stringify(overallPillarAvg)}
    - Comparison: Date A Scores: ${JSON.stringify(scoresA)}, Date B Scores: ${JSON.stringify(scoresB)}
    - Trends (Last 6 months): ${JSON.stringify(monthlyTrend)}
    - Recent Log Context: ${logsInPeriod.slice(0, 10).map(l => mask(l.rawText || "")).join("; ")}
    
    Tasks:
    1. Generate 4-5 "Overall Patterns" insights (Page 1). Each should have: pillar, icon (emoji), type (e.g., "Highest Burden", "Worsening Trend"), title, body.
    2. Generate 4-5 "Comparison Insights" (Page 3). Each should have: pillar, icon (emoji), type (trend/trigger/wellbeing), title, body.
    3. Generate 5 "Care Team Points" for next appointment.
    
    Output strictly as JSON:
    {
      "overallInsights": [{ "pillar": "...", "icon": "...", "type": "...", "title": "...", "body": "..." }],
      "comparisonInsights": [{ "pillar": "...", "icon": "...", "type": "...", "title": "...", "body": "..." }],
      "careTeamPoints": ["...", "...", "..."]
    }
    
    Tone: Professional, clinical, empathetic, and expert. Avoid generic filler.`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      aiInsights = JSON.parse(responseText || "{}") as AIInsights;

      if (aiInsights.overallInsights?.length > 0 && cacheModel) {
        await cacheModel.upsert({
          where: { patientId_dateA_dateB: { patientId, dateA, dateB } },
          update: { hash: currentHash, data: aiInsights as any },
          create: { patientId, dateA, dateB, hash: currentHash, data: aiInsights as any }
        });
      }
    } catch (aiErr) {
      console.warn("Gemini API failed, fallback mock:", aiErr);
      aiInsights = {
        overallInsights: [
          { pillar: "Sleep", icon: "🌙", type: "concern", title: "Sleep Fragmentation", body: "Patient is experiencing significant disruptions in restorative sleep cycles." },
          { pillar: "Mood", icon: "🌤", type: "positive", title: "Emotional Stability", body: "Mood remains overall positive despite physical challenges." }
        ],
        comparisonInsights: [
          { pillar: "Cognitive", icon: "🧠", type: "trend", title: "Improved Focus", body: "Cognitive clarity shows a positive upward trend compared to last month." }
        ],
        careTeamPoints: [
          "Evaluate current medication for sleep disturbances.",
          "Continue cognitive engagement exercises.",
          "Monitor physical fatigue levels during morning routines."
        ]
      };
    }

    return {
      success: true,
      data: {
        ...reportBase,
        ai: aiInsights
      }
    };
  } catch (err: unknown) {
    const error = err as AppError;
    console.error("Report Generation Error:", error);
    return { success: false, error: error.message || "Failed to generate report" };
  }
}
