import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import path from "path";

// Ensure environment variables are loaded BEFORE anything else
dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), "../.env") });

const prismaClientSingleton = () => {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.error("CRITICAL: DATABASE_URL is not defined in environment variables.");
    } else {
        console.log(`Prisma initializing with DB URL (redacted): ${dbUrl.substring(0, 20)}...`);
    }

    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
