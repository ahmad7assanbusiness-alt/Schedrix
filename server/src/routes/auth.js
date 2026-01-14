import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Registration schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  phone: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  businessName: z.string().min(1),
  businessAddress: z.string().min(1),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login schema
const loginSchema = z.object({
  emailOrPhone: z.string().min(1),
  password: z.string().min(1),
});

// Join schema (for employees)
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

// GET /auth/check-owners - Check if any owners exist
router.get("/check-owners", async (req, res) => {
  try {
    const ownerCount = await prisma.user.count({
      where: { role: "OWNER" },
    });
    res.json({ hasOwners: ownerCount > 0 });
  } catch (error) {
    console.error("Check owners error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/register - Register a new owner and business
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      phone,
      firstName,
      lastName,
      businessName,
      businessAddress,
    } = registerSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Check if phone already exists
    const existingPhone = await prisma.user.findFirst({
      where: { phone },
    });

    if (existingPhone) {
      return res.status(400).json({ error: "Phone number already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate join code
    const joinCode = generateJoinCode();

    // Create owner user
    const owner = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phone,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        role: "OWNER",
      },
    });

    // Create business
    const business = await prisma.business.create({
      data: {
        name: businessName,
        address: businessAddress,
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
      user: {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
      },
      business: {
        id: business.id,
        name: business.name,
        address: business.address,
        joinCode: business.joinCode,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Register error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// POST /auth/login - Login with email/phone + password
router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = loginSchema.parse(req.body);

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone },
        ],
      },
      include: { business: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      business: user.business
        ? {
            id: user.business.id,
            name: user.business.name,
            address: user.business.address,
            joinCode: user.business.joinCode,
          }
        : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/join - Join as employee (keep existing functionality)
router.post("/join", async (req, res) => {
  try {
    const { joinCode, employeeName } = joinSchema.parse(req.body);

    // Normalize join code: trim whitespace and convert to uppercase
    const normalizedJoinCode = joinCode.trim().toUpperCase();

    const business = await prisma.business.findUnique({
      where: { joinCode: normalizedJoinCode },
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
      user: {
        id: employee.id,
        name: employee.name,
        role: employee.role,
      },
      business: {
        id: business.id,
        name: business.name,
      },
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
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        businessId: user.businessId,
      },
      business: user.business
        ? {
            id: user.business.id,
            name: user.business.name,
            address: user.business.address,
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
