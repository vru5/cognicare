import { prisma } from "../../lib/prisma.js";
import { startOfDay, endOfDay, differenceInDays, subDays } from "date-fns";
import { RISK_KEYWORDS } from "../../constants/riskKeywords.js";

export async function getInsightsEligibilityQuery(patientId: string) {
  console.log(`[ELIGIBILITY] Checking for patientId: ${patientId}`);
  
  // Get distinct days where at least one log exists
  interface DbCount { count: bigint | number; COUNT?: bigint | number; }
  const uniqueDays = await prisma.$queryRaw<DbCount[]>`
    SELECT COUNT(DISTINCT DATE_TRUNC('day', "createdAt")) as count 
    FROM symptom_logs 
    WHERE "patientId" = ${patientId}
  `;
  
  // Robust conversion from BigInt to Number
  const result = uniqueDays[0];
  const rawCount = result?.count ?? result?.COUNT ?? 0;
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
  const sevenDaysAgo = subDays(new Date(), 7);
  const logs = await prisma.symptomLog.findMany({
    where: { 
      patientId,
      createdAt: { gte: sevenDaysAgo }
    },
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

  const symptomMap: Record<string, { severity: number; pillar: string; lastSeen: Date; patientCount: number; carerCount: number; isRisk: boolean }> = {};
  const alerts: { type: string; message: string; date: Date }[] = [];

  const todayStart = startOfDay(new Date()).getTime();

  logs.forEach(log => {
      const isToday = startOfDay(log.createdAt).getTime() === todayStart;

      // Collect risk matches for this log to avoid duplication
      const logRiskMatches = new Map<string, string>(); // keyword -> display representation

      const lowerRaw = (log.rawText || "").toLowerCase();
      // 1. Check Risk Keywords
      RISK_KEYWORDS.forEach(keyword => {
          if (lowerRaw.includes(keyword)) {
              logRiskMatches.set(keyword, keyword);
          }
      });

      // 2. Pillars extraction
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
                      symptomMap[name] = { severity: p.severity, pillar: p.key, lastSeen: log.createdAt, patientCount: 0, carerCount: 0, isRisk: false };
                  }
                  if (symptomMap[name].severity < p.severity) {
                      symptomMap[name].severity = p.severity;
                      symptomMap[name].pillar = p.key;
                      symptomMap[name].lastSeen = log.createdAt;
                  }
                  if (log.isFromCarer) symptomMap[name].carerCount++;
                  else symptomMap[name].patientCount++;

                  // Also check pillar name for risks
                  RISK_KEYWORDS.forEach(keyword => {
                      if (name.toLowerCase().includes(keyword)) {
                          logRiskMatches.set(keyword, name);
                      }
                  });
              }
          }
      });

      // 3. Alerts (Today Only)
      if (isToday) {
          logRiskMatches.forEach((displayName) => {
              alerts.push({
                  type: "red",
                  message: `Critical risk detected: ${displayName}`,
                  date: log.createdAt
              });
          });
      }

      // 4. Update Symptom Map with detected risks (Full 7-day window)
      logRiskMatches.forEach((displayName) => {
          const symptomName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
          if (!symptomMap[symptomName]) {
              symptomMap[symptomName] = { 
                  severity: 10, 
                  pillar: "mood", 
                  lastSeen: log.createdAt, 
                  patientCount: 0, 
                  carerCount: 0,
                  isRisk: true
              };
          } else {
              // If it already exists, mark it as a risk and elevate severity
              symptomMap[symptomName].isRisk = true;
              symptomMap[symptomName].severity = 10;
          }
          if (log.isFromCarer) symptomMap[symptomName].carerCount++;
          else symptomMap[symptomName].patientCount++;
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
        isRisk: data.isRisk,
        frequency: data.patientCount + data.carerCount,
        source: data.patientCount >= data.carerCount ? 'patient' : 'carer'
    }))
    .sort((a, b) => {
        // 1. Priority: Risks
        if (a.isRisk && !b.isRisk) return -1;
        if (!a.isRisk && b.isRisk) return 1;
        
        // 2. Priority: Severity
        if (b.severity !== a.severity) return b.severity - a.severity;
        
        // 3. Priority: Frequency
        return b.frequency - a.frequency;
    })
    .slice(0, 5);

  return { topSymptoms, alerts: uniqueAlerts };
}
