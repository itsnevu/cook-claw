import { PrismaClient } from "@prisma/client";

declare global {
    var __clawcookPrisma: PrismaClient | undefined;
}

export function isDatabaseConfigured(): boolean {
    return process.env.PRISMA_DB_ENABLED === "true" && Boolean(process.env.DATABASE_URL);
}

export const prisma = globalThis.__clawcookPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalThis.__clawcookPrisma = prisma;
}
