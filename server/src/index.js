import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import businessRoutes from "./routes/business.js";
import availabilityRoutes from "./routes/availability.js";
import schedulingRoutes from "./routes/scheduling.js";
import templatesRoutes from "./routes/templates.js";
import billingRoutes from "./routes/billing.js";
import prisma from "./prisma.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(cors());
app.use(express.json());

// Health check endpoint with database connection test
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, database: "connected" });
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
  const stripeKeys = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY 
      ? `${process.env.STRIPE_SECRET_KEY.substring(0, 10)}...${process.env.STRIPE_SECRET_KEY.substring(process.env.STRIPE_SECRET_KEY.length - 4)}` 
      : "NOT SET",
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID || "NOT SET",
    STRIPE_ENTERPRISE_PRICE_ID: process.env.STRIPE_ENTERPRISE_PRICE_ID || "NOT SET",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "SET (hidden)" : "NOT SET",
    CLIENT_URL: process.env.CLIENT_URL || "NOT SET",
  };
  
  res.json({
    message: "Environment variables check",
    stripe: stripeKeys,
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

app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
