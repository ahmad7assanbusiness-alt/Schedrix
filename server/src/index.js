import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import businessRoutes from "./routes/business.js";
import availabilityRoutes from "./routes/availability.js";
import schedulingRoutes from "./routes/scheduling.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "live" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/business", businessRoutes);
app.use("/availability-requests", availabilityRoutes);
app.use("/schedules", schedulingRoutes);

app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});