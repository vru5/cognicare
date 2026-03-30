import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      carer: true,
      patient: true,
    },
  });

  console.log("--- USERS & PROFILES ---");
  users.forEach(u => {
    console.log(`User: ${u.name} (Role: ${u.role})`);
    if (u.carer) console.log(`  Carer ID: ${u.carer.id}`);
    if (u.patient) console.log(`  Patient ID: ${u.patient.id}`);
  });
  
  const carers = await prisma.profileCarer.findMany({ include: { user: true } });
  console.log("\n--- ALL CARERS ---");
  carers.forEach(c => console.log(`Carer: ${c.user.name} | ID: ${c.id}`));

  const patients = await prisma.profilePatient.findMany({ include: { user: true } });
  console.log("\n--- ALL PATIENTS ---");
  patients.forEach(p => console.log(`Patient: ${p.user.name} | ID: ${p.id}`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
