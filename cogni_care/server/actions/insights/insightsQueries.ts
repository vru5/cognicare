import { prisma } from "../../lib/prisma.js";
import { startOfDay, endOfDay, differenceInDays } from "date-fns";
import { RISK_KEYWORDS } from "../../constants/riskKeywords.js";

export async function getInsightsEligibilityQuery(patientId: string) {
  console.log(`[ELIGIBILITY] Checking for patientId: ${patientId}`);
  
  // Get distinct days where at least one log exists
  const uniqueDays = await prisma.$queryRaw<any[]>`
    SELECT COUNT(DISTINCT DATE_TRUNC('day', "createdAt")) as count 
    FROM symptom_logs 
    WHERE "patientId" = ${patientId}
  `;
  
  // Robust conversion from BigInt to Number
  const rawCount = uniqueDays[0]?.count ?? uniqueDays[0]?.COUNT ?? 0;
  const daysCount = typeof rawCount === 'bigint' ? Number(rawCount) : Number(rawCount || 0);

  console.log(`[ELIGIBILITY] Result for ${patientId}: ${daysCount} distinct days.`);

  const patient = await prisma.profilePatient.findUnique({
    where: { id: patientId },
    select: { createdAt: true }
  });
  
  return { 
    eligible: daysCount >= 7,
    hasOneMonthData: daysCount >= 30,
    days: daysCount,
    joinedAt: patient?.createdAt || new Date()
  };
}


export async function getRangeAverageQuery(patientId: string, startDate: Date | string, endDate?: Date | string) {
  const start = startOfDay(new Date(startDate));
  const end = endDate ? endOfDay(new Date(endDate)) : endOfDay(new Date(startDate));

  const logs = await prisma.symptomLog.findMany({
    where: { 
      patientId,
      createdAt: {
        gte: start,
        lte: end,
      }
    },
    select: {
      physicalSeverity: true,
      moodSeverity: true,
      cognitiveSeverity: true,
      sleepSeverity: true,
      socialSeverity: true,
    }
  });
  
  if (logs.length === 0) return null;
  
  let physical = 0, mood = 0, cognitive = 0, sleep = 0, social = 0;
  logs.forEach(log => {
    physical += log.physicalSeverity || 0;
    mood += log.moodSeverity || 0;
    cognitive += log.cognitiveSeverity || 0;
    sleep += log.sleepSeverity || 0;
    social += log.socialSeverity || 0;
  });
  
  const count = logs.length;
  return {
    physical: Math.round(physical / count),
    mood: Math.round(mood / count),
    cognitive: Math.round(cognitive / count),
    sleep: Math.round(sleep / count),
    social: Math.round(social / count),
  };
}

export async function getMajorSymptomsQuery(patientId: string) {
  const logs = await prisma.symptomLog.findMany({
    where: { patientId },
    select: {
      createdAt: true,
      rawText: true,
      isFromCarer: true,
      physical: true,
      physicalSeverity: true,
      mood: true,
      moodSeverity: true,
      cognitive: true,
      cognitiveSeverity: true,
      sleep: true,
      sleepSeverity: true,
      social: true,
      socialSeverity: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (logs.length === 0) return { topSymptoms: [], alerts: [] };

  const symptomMap: Record<string, { severity: number; pillar: string; lastSeen: Date; patientCount: number; carerCount: number }> = {};
  const alerts: { type: string; message: string; date: Date }[] = [];

  const todayStart = startOfDay(new Date()).getTime();

  logs.forEach(log => {
      const isToday = startOfDay(log.createdAt).getTime() === todayStart;

      // Collect risk matches for this log to avoid duplication
      const logRiskMatches = new Map<string, string>(); // keyword -> display representation

      const lowerRaw = (log.rawText || "").toLowerCase();
      RISK_KEYWORDS.forEach(keyword => {
          if (isToday && lowerRaw.includes(keyword)) {
              logRiskMatches.set(keyword, keyword);
          }
      });

      // Pillars
      const pillars = [
          { name: log.physical, severity: log.physicalSeverity, key: "physical" },
          { name: log.mood, severity: log.moodSeverity, key: "mood" },
          { name: log.cognitive, severity: log.cognitiveSeverity, key: "cognitive" },
          { name: log.sleep, severity: log.sleepSeverity, key: "sleep" },
          { name: log.social, severity: log.socialSeverity, key: "social" },
      ];

      pillars.forEach(p => {
          if (p.name && p.severity !== null && p.severity !== undefined) {
              const name = p.name.trim();
              
              if (name.toLowerCase() !== "null" && name !== "") {
                  if (!symptomMap[name]) {
                      symptomMap[name] = { severity: p.severity, pillar: p.key, lastSeen: log.createdAt, patientCount: 0, carerCount: 0 };
                  }

                  // Update severity if this one is higher
                  if (symptomMap[name].severity < p.severity) {
                      symptomMap[name].severity = p.severity;
                      symptomMap[name].pillar = p.key;
                      symptomMap[name].lastSeen = log.createdAt;
                  }

                  // Track counts
                  if (log.isFromCarer) symptomMap[name].carerCount++;
                  else symptomMap[name].patientCount++;
                  
                  // Also check pillar name for risk keywords
                  const lowerName = name.toLowerCase();
                  RISK_KEYWORDS.forEach(keyword => {
                      if (isToday && lowerName.includes(keyword)) {
                          // Pillar match overrides or supplements rawText match for this keyword
                          logRiskMatches.set(keyword, name);
                      }
                  });
              }
          }
      });

      // Push unique alerts for this log
      logRiskMatches.forEach((displayName) => {
          alerts.push({
              type: "red",
              message: `Critical risk detected: ${displayName}`,
              date: log.createdAt
          });
      });
  });

  // Deduplicate alerts by message AND a rough timestamp (per minute) to show multiple entries
  const uniqueAlerts = Array.from(new Map(
    alerts.map(a => [`${a.message}-${new Date(a.date).toISOString().slice(0, 16)}`, a])
  ).values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const topSymptoms = Object.entries(symptomMap)
    .map(([name, data]) => ({ 
        name, 
        severity: data.severity,
        pillar: data.pillar,
        lastSeen: data.lastSeen,
        source: data.patientCount >= data.carerCount ? 'patient' : 'carer'
    }))
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 5);

  return { topSymptoms, alerts: uniqueAlerts };
}
