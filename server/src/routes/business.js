import express from "express";
import prisma from "../prisma.js";
import { authMiddleware, managerOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /business
router.get("/", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(404).json({ error: "Business not found" });
    }

    const business = await prisma.business.findUnique({
      where: { id: req.user.businessId },
    });

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    res.json({
      id: business.id,
      name: business.name,
      joinCode: business.joinCode,
      subscriptionStatus: business.subscriptionStatus,
    });
  } catch (error) {
    console.error("Business error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /business/employees - Get all employees in the business
router.get("/employees", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(404).json({ error: "Business not found" });
    }

    const employees = await prisma.user.findMany({
      where: { businessId: req.user.businessId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(employees);
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

