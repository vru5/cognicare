import "dotenv/config";
import { defineConfig, PrismaConfig } from "prisma/config";

const config: PrismaConfig = {
    schema: "prisma/schema.prisma",
    datasource: {
        url: process.env.DATABASE_URL,
       // directUrl: process.env.DIRECT_URL,
    },
};

export default defineConfig(config);
