import { PrismaClient } from "@prisma/client";

// Optimize Prisma Client for production with connection pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool configuration (if using connection pooling service like PgBouncer)
  // The connection_limit and pool_timeout should be set in DATABASE_URL query params
  // Example: postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
});

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;

