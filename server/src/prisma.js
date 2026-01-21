import { PrismaClient } from "@prisma/client";

// Optimize Prisma Client for production with connection pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// Ensure proper connection handling
prisma.$on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;

