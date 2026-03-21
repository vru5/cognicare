import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const patientDisplayId = "PAT-1773597115695";
    const patient = await prisma.profilePatient.findUnique({
        where: { id: patientDisplayId },
        include: { user: true }
    });

    if (patient) {
        console.log("Patient found:", JSON.stringify(patient, null, 2));
    } else {
        console.log("Patient not found. Fetching all patients...");
        const allPatients = await prisma.profilePatient.findMany({
            include: { user: true }
        });
        console.log("All patients:", JSON.stringify(allPatients, null, 2));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
