import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const patients = await prisma.profilePatient.findMany({
    select: { id: true, userId: true, pushToken: true }
  });
  const carers = await prisma.profileCarer.findMany({
      select: { id: true, userId: true, pushToken: true }
  });
  
  console.log('--- PATIENTS ---');
  console.table(patients);
  console.log('--- CARERS ---');
  console.table(carers);
  
  await prisma.$disconnect();
}

check();
