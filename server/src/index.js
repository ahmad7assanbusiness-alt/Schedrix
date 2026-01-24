import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load environment variables first
dotenv.config();

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if Prisma client exists, generate only if missing (fallback for build failures)
const prismaClientPath = join(__dirname, "../node_modules/.prisma/client");
const needsGeneration = !existsSync(prismaClientPath);

if (needsGeneration) {
  console.log("Prisma Client not found, generating as fallback...");
  try {
    // Use a dummy DATABASE_URL for generation (not needed for client generation)
    const generateEnv = {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy"
    };
    execSync("npx prisma generate --schema=./prisma/schema.prisma", { 
      stdio: "pipe",
      env: generateEnv,
      cwd: join(__dirname, ".."),
      timeout: 15000 // 15 second timeout
    });
    console.log("Prisma Client generated successfully");
  } catch (error) {
    console.error("Error generating Prisma Client:", error.message);
    console.error("This should have been generated during build. Continuing anyway...");
  }
} else {
  console.log("Prisma Client found, ready to use");
}

import authRoutes from "./routes/auth.js";
import businessRoutes from "./routes/business.js";
import availabilityRoutes from "./routes/availability.js";
import schedulingRoutes from "./routes/scheduling.js";
import templatesRoutes from "./routes/templates.js";
import billingRoutes from "./routes/billing.js";
import prisma from "./prisma.js";

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "0.0.0.0";

// Add compression middleware (should be early in the middleware chain)
// Temporarily disabled to debug blank screen issue
// app.use(compression());

// Add request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  res.setTimeout(30000);
  next();
});

app.use(cors());

// Limit request body size to prevent large payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health check endpoint with database connection test (optimized)
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1 as health`;
    res.json({ ok: true, database: "connected", timestamp: Date.now() });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({ ok: false, database: "disconnected", error: error.message });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "live", database: "connected" });
  } catch (error) {
    console.error("API health check failed:", error);
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

// Debug endpoint to check environment variables (remove in production if desired)
app.get("/api/debug/env", (req, res) => {
  const getRedirectUri = () => {
    if (process.env.GOOGLE_REDIRECT_URI) {
      return process.env.GOOGLE_REDIRECT_URI;
    }
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return `${clientUrl}/auth/google/callback`;
  };

  const stripeKeys = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY 
      ? `${process.env.STRIPE_SECRET_KEY.substring(0, 10)}...${process.env.STRIPE_SECRET_KEY.substring(process.env.STRIPE_SECRET_KEY.length - 4)}` 
      : "NOT SET",
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID || "NOT SET",
    STRIPE_ENTERPRISE_PRICE_ID: process.env.STRIPE_ENTERPRISE_PRICE_ID || "NOT SET",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "SET (hidden)" : "NOT SET",
    CLIENT_URL: process.env.CLIENT_URL || "NOT SET",
  };

  const googleOAuth = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID 
      ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...` 
      : "NOT SET",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET (hidden)" : "NOT SET",
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "NOT SET (using computed)",
    computedRedirectUri: getRedirectUri(),
  };
  
  res.json({
    message: "Environment variables check",
    stripe: stripeKeys,
    googleOAuth: googleOAuth,
    nodeEnv: process.env.NODE_ENV || "not set",
  });
});

// Routes
app.use("/auth", authRoutes);
app.use("/business", businessRoutes);
app.use("/availability-requests", availabilityRoutes);
app.use("/schedules", schedulingRoutes);
app.use("/templates", templatesRoutes);
app.use("/billing", billingRoutes);
app.use("/notifications", notificationsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  await prisma.$disconnect();
  process.exit(0);
});

// Start server immediately to avoid Cloud Run timeout
const server = app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Health check available at http://${HOST}:${PORT}/health`);
});

// Set server timeout to match Cloud Run requirements
server.keepAliveTimeout = 61000; // 61 seconds
server.headersTimeout = 62000; // 62 seconds

// Memory monitoring (log every 5 minutes in production)
if (process.env.NODE_ENV === "production") {
  setInterval(() => {
    const usage = process.memoryUsage();
    console.log("[Memory Usage]", {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
    });
  }, 5 * 60 * 1000); // Every 5 minutes
}
