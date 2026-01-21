import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import businessRoutes from "./routes/business.js";
import availabilityRoutes from "./routes/availability.js";
import schedulingRoutes from "./routes/scheduling.js";
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
    await prisma.$queryRaw\`SELECT 1\`;
    res.json({ ok: true, database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({ ok: false, database: "disconnected", error: error.message });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw\`SELECT 1\`;
    res.json({ status: "live", database: "connected" });
  } catch (error) {
    console.error("API health check failed:", error);
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

// Routes
app.use("/auth", authRoutes);
app.use("/business", businessRoutes);
app.use("/availability-requests", availabilityRoutes);
app.use("/schedules", schedulingRoutes);

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
  console.log(\`Server listening on \${HOST}:\${PORT}\`);
  console.log(\`Environment: \${process.env.NODE_ENV || "development"}\`);
});
