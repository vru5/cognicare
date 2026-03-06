import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const userId = "cm7pm9uog0000uxps30r9qnh2";

    const user = await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
            id: userId,
            name: "Test Patient",
            role: "patient"
        },
    });

    console.log("Ensured user exists:", user);
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
