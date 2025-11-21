import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not defined");
}

export const prisma = new PrismaClient({
    datasourceUrl: databaseUrl,
});