import { prisma } from "./server/lib/prisma";

async function main() {
  const patientId = "PAT-1773597115695";
  
  const startDate = new Date("2026-03-01T08:00:00Z");
  const endDate = new Date();
  
  const daysDifference = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  
  let entryCount = 0;

  for (let i = 0; i <= daysDifference; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const logsPerDay = Math.floor(Math.random() * 2) + 2;
    
    for (let j = 0; j < logsPerDay; j++) {
      const logDate = new Date(currentDate);
      logDate.setHours(8 + j * 5 + Math.floor(Math.random() * 3));
      
      const physicalSeverity = Math.floor(Math.random() * 6) + 3;
      const moodSeverity = Math.floor(Math.random() * 8) + 1;
      const cognitiveSeverity = Math.floor(Math.random() * 5) + 2;
      const sleepSeverity = Math.floor(Math.random() * 7) + 2;
      const socialSeverity = Math.floor(Math.random() * 5) + 1;
      
      await prisma.symptomLog.create({
        data: {
          patientId,
          createdAt: logDate,
          rawText: "Mock entry auto-generated from Mar 1st to today.",
          physical: physicalSeverity > 5 ? "Had a lot of physical pain." : "Physical pain manageable.",
          physicalSeverity,
          mood: moodSeverity > 5 ? "Felt depressed." : "Mood stable.",
          moodSeverity,
          cognitive: cognitiveSeverity > 5 ? "Heavy brain fog." : "Cognition clear.",
          cognitiveSeverity,
          sleep: sleepSeverity > 5 ? "Poor sleep." : "Slept okay.",
          sleepSeverity,
          social: socialSeverity > 5 ? "Isolated myself." : "Talked with family.",
          socialSeverity,
        }
      });
      entryCount++;
    }
  }
  
  console.log(`Successfully seeded ${entryCount} new log entries for patient ${patientId} from Mar 1st to today.`);
}

main()
  .catch(e => { console.log("ERROR IS: " + e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
