import { PrismaClient } from "@prisma/client";
import { buildDatabaseUrl } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  // Ensure Prisma always sees DATABASE_URL, including when assembled from DB_*
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = buildDatabaseUrl();
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
