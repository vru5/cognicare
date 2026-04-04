/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../lib/prisma.js";
import { getMajorSymptomsQuery } from "../insights/insightsQueries.js";
import { RISK_KEYWORDS } from "../../constants/riskKeywords.js";
import { NHS_GUIDANCE_PROMPT } from "../../constants/prompts.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError, Analysis } from "server/types/logsApi.js";
import { AIInsights, ProfessionalReportResponse } from "server/types/exportTypes.js";
import { format, subMonths, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import crypto from "crypto";
import { mask } from "@yellowsakura/js-pii-mask";
import { getAIInsightsSummary } from "../insights/aiInsightsActions.js";

export async function generateProfessionalReportAction(
  patientId: string,
  dateA: string,
  dateB: string,
  providedSymptoms?: any
): Promise<ProfessionalReportResponse> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    // 0. Fetch Major Symptoms & Alerts (7-Day Context)
    const majorSymptoms = providedSymptoms || await getMajorSymptomsQuery(patientId);

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

    // 5. Period Analytics
    const logsInPeriod = allLogs.filter(l => l.createdAt >= startTime && l.createdAt <= endTime);
    const periodPillarAvg = getDailyAvg(logsInPeriod);
    const { pRes: patientPeriodPillarLogs, cRes: carerPeriodPillarLogs } = getDailyCounts(logsInPeriod);

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
      diff: +((scoresB[p] || 0) - (scoresA[p] || 0)).toFixed(1),
      scoreA: scoresA[p] || 0,
      scoreB: scoresB[p] || 0,
    }));

    const worseningPillar = pillarDiffs.reduce((a, b) => b.diff > a.diff ? b : a);
    const improvementPillar = pillarDiffs.reduce((a, b) => b.diff < a.diff ? b : a);
    const stablePillar = pillarDiffs.reduce((a, b) => Math.abs(b.diff) < Math.abs(a.diff) ? b : a);

    // 6. Caching & AI
    const hashData = JSON.stringify(logsInPeriod.map(l => ({
      p: l.physicalSeverity, m: l.moodSeverity, c: l.cognitiveSeverity,
      s: l.sleepSeverity, so: l.socialSeverity, t: l.rawText
    })));
    const currentHash = crypto.createHash("md5").update(hashData + "-v3").digest("hex");

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

    // Get Shared AI Insights (Fetching from cache if available)
    const sharedInsights = await getAIInsightsSummary(patientId, dateA, dateB);

    let aiInsights: AIInsights = {
      ...sharedInsights,
      nhsGuidance: { clinicalAlignment: "", suggestedDiagnosticSteps: [], carersCorner: [] }
    };
    const cacheModel = (prisma as any).professionalReportCache;

    // 7. Define Base Report Data (DRY)
    const reportBase = {
      patient: { name: patientName, id: patientId, diagnosisDate: format(patientProfile.createdAt, "dd MMM yyyy") },
      period: {
        dateA: format(new Date(dateA), "dd MMM yyyy"),
        dateB: format(new Date(dateB), "dd MMM yyyy"),
        entries: logsInPeriod.length
      },
      overall: {
        pillarAvg: overallPillarAvg,
        periodPillarAvg,
        patientPillarAvg,
        carerPillarAvg,
        patientPillarLogs,
        carerPillarLogs,
        patientPeriodPillarLogs,
        carerPeriodPillarLogs,
        monthlyTrend,
        patientMonthlyTrend,
        carerMonthlyTrend,
        patientMonthlyLogs,
        carerMonthlyLogs,
        months
      },
      comparison: { scoresA, scoresB, patientScoresA, carerScoresA, patientScoresB, carerScoresB, patientPillarLogsA, carerPillarLogsA, patientPillarLogsB, carerPillarLogsB, totalA, totalB, overallChange, logsCountA, logsCountB, patientLogsA, carerLogsA, patientLogsB, carerLogsB, biggestWorsening: worseningPillar, biggestImprovement: improvementPillar, mostStable: stablePillar },
      summary: {
        diagnosisDate: format(patientProfile.createdAt, "dd MMM yyyy"),
        totalLogs: logsInPeriod.length,
        patientLogsCount: logsInPeriod.filter(l => !l.isFromCarer).length,
        carerLogsCount: logsInPeriod.filter(l => l.isFromCarer).length,
        highestBurden: pCfg[highestBurdenKey] || pCfg.sleep,
        mostManaged: pCfg[mostManagedKey] || pCfg.social,
        majorSymptoms,
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
    const maskedLogsText = logsInPeriod.slice(0, 50).map(l => mask(l.rawText || "")).join("; ");
    const prompt = NHS_GUIDANCE_PROMPT(
      mask(patientName),
      startTime,
      endTime,
      overallPillarAvg,
      scoresA,
      scoresB,
      monthlyTrend,
      maskedLogsText,
      RISK_KEYWORDS
    );

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const guidance = JSON.parse(responseText || "{}") as Pick<AIInsights, 'nhsGuidance'>;
    aiInsights.nhsGuidance = guidance.nhsGuidance;

    if (aiInsights.summary && cacheModel) {
      await cacheModel.upsert({
        where: { patientId_dateA_dateB: { patientId, dateA, dateB } },
        update: { hash: currentHash, data: aiInsights as any },
        create: { patientId, dateA, dateB, hash: currentHash, data: aiInsights as any }
      });
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
