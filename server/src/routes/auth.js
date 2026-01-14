import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

const bootstrapSchema = z.object({
  businessName: z.string().min(1),
  ownerName: z.string().min(1),
});

const joinSchema = z.object({
  joinCode: z.string().min(1),
  employeeName: z.string().min(1),
});

// Generate a random join code
function generateJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /auth/bootstrap-owner
router.post("/bootstrap-owner", async (req, res) => {
  try {
    const { businessName, ownerName } = bootstrapSchema.parse(req.body);

    const joinCode = generateJoinCode();

    // Create owner user
    const owner = await prisma.user.create({
      data: {
        name: ownerName,
        role: "OWNER",
      },
    });

    // Create business
    const business = await prisma.business.create({
      data: {
        name: businessName,
        joinCode,
        ownerUserId: owner.id,
        subscriptionStatus: "active",
      },
    });

    // Update user with businessId
    await prisma.user.update({
      where: { id: owner.id },
      data: { businessId: business.id },
    });

    const token = generateToken(owner.id);

    res.json({
      token,
      user: { id: owner.id, name: owner.name, role: owner.role },
      business: { id: business.id, name: business.name, joinCode: business.joinCode },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Bootstrap error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/join
router.post("/join", async (req, res) => {
  try {
    const { joinCode, employeeName } = joinSchema.parse(req.body);

    const business = await prisma.business.findUnique({
      where: { joinCode },
    });

    if (!business) {
      return res.status(404).json({ error: "Invalid join code" });
    }

    // Create employee user
    const employee = await prisma.user.create({
      data: {
        name: employeeName,
        role: "EMPLOYEE",
        businessId: business.id,
      },
    });

    const token = generateToken(employee.id);

    res.json({
      token,
      user: { id: employee.id, name: employee.name, role: employee.role },
      business: { id: business.id, name: business.name },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Join error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /auth/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { business: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        businessId: user.businessId,
      },
      business: user.business
        ? {
            id: user.business.id,
            name: user.business.name,
            joinCode: user.business.joinCode,
          }
        : null,
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

