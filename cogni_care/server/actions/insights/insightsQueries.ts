import { prisma } from "../../lib/prisma.js";
import { startOfDay, endOfDay, differenceInDays } from "date-fns";

export async function getInsightsEligibilityQuery(patientId: string) {
  // Get distinct days where at least one log exists
  const uniqueDays = await prisma.$queryRaw<any[]>`
    SELECT COUNT(DISTINCT DATE_TRUNC('day', "createdAt")) as count 
    FROM symptom_logs 
    WHERE "patientId" = ${patientId}
  `;
  
  // Use Number() to convert BigInt if necessary
  const daysCount = uniqueDays[0]?.count ? Number(uniqueDays[0].count) : 0;

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

export async function getAllTimeLogAggregatesQuery(patientId: string) {
  const logs = await prisma.symptomLog.findMany({
    where: { patientId },
    select: {
      physicalSeverity: true,
      moodSeverity: true,
      cognitiveSeverity: true,
      sleepSeverity: true,
      socialSeverity: true,
    }
  });
  
  if (logs.length === 0) return [];

  let physical = 0, mood = 0, cognitive = 0, sleep = 0, social = 0;
  logs.forEach(log => {
    physical += log.physicalSeverity || 0;
    mood += log.moodSeverity || 0;
    cognitive += log.cognitiveSeverity || 0;
    sleep += log.sleepSeverity || 0;
    social += log.socialSeverity || 0;
  });
  
  return [
    { name: "Physical", value: physical, fill: "var(--color-physical)" },
    { name: "Mood", value: mood, fill: "var(--color-mood)" },
    { name: "Cognitive", value: cognitive, fill: "var(--color-cognitive)" },
    { name: "Sleep", value: sleep, fill: "var(--color-sleep)" },
    { name: "Social", value: social, fill: "var(--color-social)" },
  ];
}

export async function getDailyAverageQuery(patientId: string, date: Date | string) {
  const targetDate = new Date(date);
  const logs = await prisma.symptomLog.findMany({
    where: { 
      patientId,
      createdAt: {
        gte: startOfDay(targetDate),
        lte: endOfDay(targetDate),
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
  
  return {
    physical: Math.round(physical / logs.length),
    mood: Math.round(mood / logs.length),
    cognitive: Math.round(cognitive / logs.length),
    sleep: Math.round(sleep / logs.length),
    social: Math.round(social / logs.length),
  };
}
