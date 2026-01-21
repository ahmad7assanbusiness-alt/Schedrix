import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Registration schema - simplified
const registerSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Join schema (for employees)
const joinSchema = z.object({
  joinCode: z.string().min(1),
  employeeName: z.string().min(1),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
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
    // Log incoming request for debugging
    console.log("Registration request body:", JSON.stringify(req.body, null, 2));
    
    const { businessName, ownerName, email, password } = registerSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate join code
    const joinCode = generateJoinCode();

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create owner user
      const owner = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: ownerName,
          role: "OWNER",
        },
      });

      console.log("Created owner user:", owner.id);

      // Create business
      const business = await tx.business.create({
        data: {
          name: businessName,
          joinCode,
          ownerUserId: owner.id,
          subscriptionStatus: "active",
        },
      });

      console.log("Created business:", business.id);

      // Update user with businessId
      const updatedOwner = await tx.user.update({
        where: { id: owner.id },
        data: { businessId: business.id },
      });

      console.log("Updated user with businessId");

      return { owner: updatedOwner, business };
    });

    // Return success (don't return token - user must login)
    res.json({
      success: true,
      message: "Registration successful. Please login.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    
    // Log full error for debugging
    console.error("Register error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    
    // Return more helpful error message
    let errorMessage = "Internal server error";
    if (error.code === "P2002") {
      errorMessage = "A record with this email already exists";
    } else if (error.code === "P1001") {
      errorMessage = "Database connection error. Please check database configuration.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      error: errorMessage,
      ...(process.env.NODE_ENV === "development" && {
        details: error.stack,
        code: error.code,
      }),
    });
  }
});

// POST /auth/login - Login with email + password
router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
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

    // Generate token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/join - Join as employee
router.post("/join", async (req, res) => {
  try {
    const { joinCode, employeeName, email, password, phone } = joinSchema.parse(req.body);

    // Normalize join code: trim whitespace and convert to uppercase
    const normalizedJoinCode = joinCode.trim().toUpperCase();

    const business = await prisma.business.findUnique({
      where: { joinCode: normalizedJoinCode },
    });

    if (!business) {
      return res.status(404).json({ error: "Invalid join code" });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee user
    // Note: firstName/lastName are combined into name, phone is not stored in current schema
    const employee = await prisma.user.create({
      data: {
        name: employeeName,
        email,
        password: hashedPassword,
        role: "EMPLOYEE",
        businessId: business.id,
      },
    });

    // Return success (don't return token - user must login)
    res.json({
      success: true,
      message: "Registration successful. Please login.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Join error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/complete-onboarding - Mark onboarding as complete
router.post("/complete-onboarding", authMiddleware, async (req, res) => {
  try {
    const { calendarIntegrations } = req.body;

    // Update user onboarding status
    await prisma.user.update({
      where: { id: req.user.id },
      data: { onboardingCompleted: true },
    });

    // In the future, save calendar integration preferences here
    // For now, we just mark onboarding as complete

    res.json({ success: true });
  } catch (error) {
    console.error("Complete onboarding error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /auth/profile - Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: req.user.id },
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
    });

    res.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        businessId: updatedUser.businessId,
        onboardingCompleted: updatedUser.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /auth/change-password - Change user password
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.password) {
      return res.status(400).json({ error: "User not found or no password set" });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /auth/calendar-integrations - Get user's calendar integrations
router.get("/calendar-integrations", authMiddleware, async (req, res) => {
  try {
    const integrations = await prisma.calendarIntegration.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        provider: true,
        enabled: true,
        createdAt: true,
      },
    });

    res.json(integrations);
  } catch (error) {
    console.error("Get calendar integrations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /auth/calendar-integrations/:id - Disconnect calendar integration
router.delete("/calendar-integrations/:id", authMiddleware, async (req, res) => {
  try {
    // Verify ownership
    const integration = await prisma.calendarIntegration.findUnique({
      where: { id: req.params.id },
    });

    if (!integration || integration.userId !== req.user.id) {
      return res.status(404).json({ error: "Integration not found" });
    }

    await prisma.calendarIntegration.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Delete calendar integration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /auth/me - Get current user
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
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        onboardingCompleted: user.onboardingCompleted,
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
