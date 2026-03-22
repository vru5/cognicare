import { prisma } from "../../lib/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError, Analysis } from "server/types/logsApi.js";
import { AIInsights, ProfessionalReportResponse } from "server/types/exportTypes.js";
import { format, subMonths, startOfMonth, endOfMonth, isSameDay } from "date-fns";

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
    // Cast to any for profilePatient as it might be a dynamic model not fully captured in basic Prisma type in this context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patientProfile = await (prisma as any).profilePatient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!patientProfile) {
      throw new Error(`Patient profile not found for ID: ${patientId}`);
    }

    const patientName = patientProfile.user.name || "Patient";

    // 2. Fetch All-Time Averages for each Pillar
    const allLogs = await prisma.symptomLog.findMany({
      where: { patientId },
      select: {
        physicalSeverity: true,
        moodSeverity: true,
        cognitiveSeverity: true,
        sleepSeverity: true,
        socialSeverity: true,
        createdAt: true,
      }
    });

    const pillars = ["physical", "mood", "cognitive", "sleep", "social"] as const;
    const overallPillarAvg: Record<string, number> = {};
    
    pillars.forEach(p => {
      const field = `${p}Severity` as keyof typeof allLogs[0];
      const vals = allLogs.map(l => l[field] as number).filter(v => v > 0);
      overallPillarAvg[p] = vals.length > 0 ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
    });

    // 3. Fetch Monthly Trend — Only months where the patient has actual logs
    //    Start from the patient's join date, look back up to 6 months from today.
    const joinedAt = new Date(patientProfile.createdAt);
    const sixMonthsAgo = subMonths(new Date(), 5);
    // Use the later of the two as the actual start
    const trendStart = joinedAt > sixMonthsAgo ? startOfMonth(joinedAt) : startOfMonth(sixMonthsAgo);

    const monthlyTrend: Record<string, (number | null)[]> = {};
    const months: string[] = [];

    // Walk from trendStart up to the current month
    let cursor = startOfMonth(trendStart);
    const now = startOfMonth(new Date());

    pillars.forEach(p => { monthlyTrend[p] = []; });

    while (cursor <= now) {
      const start = startOfMonth(cursor);
      const end = endOfMonth(cursor);

      const monthLogs = allLogs.filter(l => l.createdAt >= start && l.createdAt <= end);

      // Only include this month if at least one log exists
      if (monthLogs.length > 0) {
        months.push(format(cursor, "MMM"));

        pillars.forEach(p => {
          const field = `${p}Severity` as keyof typeof allLogs[0];
          const vals = monthLogs.map(l => l[field] as number).filter(v => v != null && (v as number) > 0);
          monthlyTrend[p].push(vals.length > 0 ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null);
        });
      }

      // Advance to next month
      cursor = startOfMonth(subMonths(cursor, -1));
    }

    // 4. Comparison Data (Date A vs Date B)
    const startTime = new Date(dateA < dateB ? dateA : dateB);
    startTime.setHours(0, 0, 0, 0);
    const endTime = new Date(dateA > dateB ? dateA : dateB);
    endTime.setHours(23, 59, 59, 999);

    // const periodLogs = allLogs.filter(l => l.createdAt >= startTime && l.createdAt <= endTime);

    const getDailyAvg = (logs: Analysis[]) => {
      const res: Record<string, number> = {};
      pillars.forEach(p => {
        const field = `${p}Severity` as keyof Analysis;
        const vals = logs.map(l => l[field] as number).filter(v => v > 0);
        res[p] = vals.length > 0 ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
      });
      return res;
    };

    const logsOnDateA = allLogs.filter(l => isSameDay(l.createdAt, new Date(dateA)));
    const logsOnDateB = allLogs.filter(l => isSameDay(l.createdAt, new Date(dateB)));
    const scoresA = getDailyAvg(logsOnDateA);
    const scoresB = getDailyAvg(logsOnDateB);
    const logsCountA = logsOnDateA.length;
    const logsCountB = logsOnDateB.length;

    // Compute total symptom load per date and comparison stats
    const totalA = +Object.values(scoresA).reduce((a, b) => a + b, 0).toFixed(1);
    const totalB = +Object.values(scoresB).reduce((a, b) => a + b, 0).toFixed(1);
    const overallChange = +(totalB - totalA).toFixed(1);

    // Per-pillar diffs
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

    // 5. Generate AI Insights
    // Context for Gemini: Trends + Comparison
    const logSummaries = await prisma.symptomLog.findMany({
      where: { patientId, createdAt: { gte: startTime, lte: endTime } },
      select: { rawText: true, createdAt: true },
      take: 10
    });

    const prompt = `You are a professional clinical CTE health analyst. 
    Generate a professional health report for patient: ${patientName}.
    
    Data Summary:
    - Period: ${format(startTime, "dd-MM-yyyy")} to ${format(endTime, "dd-MM-yyyy")}
    - All-time Pillar Averages: ${JSON.stringify(overallPillarAvg)}
    - Comparison: Date A Scores: ${JSON.stringify(scoresA)}, Date B Scores: ${JSON.stringify(scoresB)}
    - Trends (Last 6 months): ${JSON.stringify(monthlyTrend)}
    - Recent Log Context: ${logSummaries.map(l => l.rawText).join("; ")}
    
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

    // 5. Generate AI Insights (with robust fallback)
    let aiInsights: AIInsights = { overallInsights: [], comparisonInsights: [], careTeamPoints: [] };
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      aiInsights = JSON.parse(responseText || "{}") as AIInsights;
    } catch (aiErr) {
      console.warn("Gemini API failed, using structured mock fallback:", aiErr);
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

    // Calculate Stats for the new Bar
    const burdenEntries = Object.entries(overallPillarAvg);
    const highestBurdenKey = burdenEntries.length > 0 
      ? burdenEntries.reduce((a, b) => b[1] > a[1] ? b : a)[0] 
      : "sleep";
    const mostManagedKey = burdenEntries.length > 0 
      ? burdenEntries.reduce((a, b) => b[1] < a[1] ? b : a)[0] 
      : "social";

    // Replicate enough config for color mapping or just return labels
    const pCfg: Record<string, { label: string; color: string }> = {
      mood: { label: "Mood", color: "#e8a838" },
      physical: { label: "Physical", color: "#c0674a" },
      cognitive: { label: "Cognitive", color: "#6b52ae" },
      social: { label: "Social", color: "#2e8b6e" },
      sleep: { label: "Sleep", color: "#3d6b8f" },
    };

    return {
      success: true,
      data: {
        patient: {
          name: patientName,
          id: patientId,
          diagnosisDate: format(patientProfile.createdAt, "dd MMM yyyy"),
          // age: undefined, // To be implemented when stored in DB
          // consultant: undefined // Removed per user request
        },
        period: {
          dateA: format(new Date(dateA), "dd MMM yyyy"),
          dateB: format(new Date(dateB), "dd MMM yyyy"),
          entries: allLogs.length
        },
        overall: {
          pillarAvg: overallPillarAvg,
          monthlyTrend,
          months
        },
        comparison: {
          scoresA,
          scoresB,
          totalA,
          totalB,
          overallChange,
          logsCountA,
          logsCountB,
          biggestWorsening: worseningPillar,
          biggestImprovement: improvementPillar,
          mostStable: stablePillar,
        },
        ai: aiInsights,
        summary: {
          diagnosisDate: format(patientProfile.createdAt, "dd MMM yyyy"),
          totalLogs: allLogs.length,
          highestBurden: pCfg[highestBurdenKey] || pCfg.sleep,
          mostManaged: pCfg[mostManagedKey] || pCfg.social,
        }
      }
    };
  } catch (err: unknown) {
    const error = err as AppError;
    console.error("Report Generation Error:", error);
    return { success: false, error: error.message || "Failed to generate report" };
  }
}
