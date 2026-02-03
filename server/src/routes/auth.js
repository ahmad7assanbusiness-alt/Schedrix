import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import dns from "dns";
import { promisify } from "util";
import { OAuth2Client } from "google-auth-library";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { initializeBusinessDatabase } from "../db/schemaManager.js";

const resolveMx = promisify(dns.resolveMx);

const router = express.Router();

// Initialize Google OAuth client
const getRedirectUri = () => {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return `${clientUrl}/auth/google/callback`;
};

// Helper function to get Google OAuth client (with validation)
// Cache Google OAuth client to avoid recreation
let googleClientCache = null;

const getGoogleClient = () => {
  // Return cached client if available
  if (googleClientCache) {
    return googleClientCache;
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
  }
  
  const redirectUri = getRedirectUri();
  googleClientCache = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
  
  return googleClientCache;
};

// Log redirect URI for debugging
console.log("Google OAuth Configuration:");
console.log("  Redirect URI:", getRedirectUri());
console.log("  Client ID configured:", !!process.env.GOOGLE_CLIENT_ID);
console.log("  Client Secret configured:", !!process.env.GOOGLE_CLIENT_SECRET);
if (process.env.GOOGLE_CLIENT_ID) {
  console.log("  Client ID (first 10 chars):", process.env.GOOGLE_CLIENT_ID.substring(0, 10) + "...");
}

// Password validation function
function validatePassword(password) {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
}

// DNS cache for email domain validation
const dnsCache = new Map();
const DNS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Cleanup DNS cache periodically
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [domain, cacheEntry] of dnsCache.entries()) {
    if (now - cacheEntry.timestamp > DNS_CACHE_TTL) {
      dnsCache.delete(domain);
      cleaned++;
    }
  }
  if (cleaned > 0 && process.env.NODE_ENV === "development") {
    console.log(`[DNS Cache] Cleared ${cleaned} stale entries`);
  }
}, 60 * 60 * 1000); // Run cleanup every hour

// Email domain validation function with caching
async function validateEmailDomain(email) {
  try {
    // Extract domain from email
    const domain = email.split("@")[1];
    if (!domain) {
      return "Invalid email format";
    }

    // Check cache first
    const cached = dnsCache.get(domain);
    if (cached && Date.now() - cached.timestamp < DNS_CACHE_TTL) {
      return cached.result;
    }

    let result = null;

    // Check if domain has MX records (can receive emails)
    try {
      const mxRecords = await resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        // If no MX records, check for A record (some domains use A records for mail)
        try {
          const resolve4 = promisify(dns.resolve4);
          await resolve4(domain);
          result = null; // Domain exists with A record
        } catch (aError) {
          result = "Email domain does not exist or cannot receive emails. Please use a valid email address.";
        }
      } else {
        result = null; // Domain has valid MX records
      }
    } catch (mxError) {
      // If MX lookup fails, try A record as fallback
      try {
        const resolve4 = promisify(dns.resolve4);
        await resolve4(domain);
        result = null; // Domain exists with A record
      } catch (aError) {
        result = "Email domain does not exist or cannot receive emails. Please use a valid email address.";
      }
    }

    // Cache result (limit cache size to prevent memory issues)
    if (dnsCache.size > 1000) {
      // Remove oldest entries
      const entries = Array.from(dnsCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < 100; i++) {
        dnsCache.delete(entries[i][0]);
      }
    }
    dnsCache.set(domain, { result, timestamp: Date.now() });

    return result;
  } catch (error) {
    console.error("Email domain validation error:", error);
    // Don't block registration if DNS lookup fails (could be network issue)
    // Return null to allow registration to proceed
    return null;
  }
}

// Registration schema - simplified
const registerSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Login schema with role check
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  expectedRole: z.enum(["OWNER", "EMPLOYEE"]).optional(), // Frontend can specify expected role
});

// Join schema (for employees)
const joinSchema = z.object({
  joinCode: z.string().min(1),
  employeeName: z.string().min(1),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  phone: z.string().optional(),
});

// Generate a random join code
function generateJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// Generate JWT token
function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
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
      return res.status(400).json({ error: "This email is already registered. Please use a different email or login instead." });
    }

    // Validate email domain (check if domain exists and can receive emails)
    const domainError = await validateEmailDomain(email);
    if (domainError) {
      return res.status(400).json({ error: domainError });
    }

    // Validate password requirements
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
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

    // Initialize the business's dedicated database schema
    try {
      await initializeBusinessDatabase(result.business.id);
      console.log(`Business database initialized for: ${result.business.id}`);
    } catch (dbError) {
      console.error("Error initializing business database:", dbError);
      // Don't fail registration if schema creation fails - we can retry later
      // But log it for monitoring
    }

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
    const { email, password, expectedRole } = loginSchema.parse(req.body);

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

    // Check role mismatch if expectedRole is provided
    if (expectedRole) {
      if (expectedRole === "OWNER" && user.role !== "OWNER" && user.role !== "MANAGER") {
        return res.status(403).json({ 
          error: "ROLE_MISMATCH",
          message: "This is an employee account. Please login under the Employee tab.",
          actualRole: user.role,
          expectedRole: "OWNER"
        });
      }
      if (expectedRole === "EMPLOYEE" && (user.role === "OWNER" || user.role === "MANAGER")) {
        return res.status(403).json({ 
          error: "ROLE_MISMATCH",
          message: "This is an owner/manager account. Please login under the Owner tab.",
          actualRole: user.role,
          expectedRole: "EMPLOYEE"
        });
      }
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
      return res.status(400).json({ error: "This email is already registered. Please use a different email or login instead." });
    }

    // Validate email domain (check if domain exists and can receive emails)
    const domainError = await validateEmailDomain(email);
    if (domainError) {
      return res.status(400).json({ error: domainError });
    }

    // Validate password requirements
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
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
    const { calendarIntegrations, colorScheme } = req.body;

    // Update user onboarding status and save color scheme to user
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        onboardingCompleted: true,
        ...(colorScheme && { colorScheme }),
      },
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
        colorScheme: updatedUser.colorScheme,
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

    // Validate password requirements
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
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
        notificationPermission: user.notificationPermission || "pending",
        notificationPrompted: user.notificationPrompted || false,
        colorScheme: user.colorScheme,
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

// GET /auth/google - Initiate Google OAuth flow
router.get("/google", (req, res) => {
  try {
    const googleClient = getGoogleClient();
    
    const { role, joinCode } = req.query;
    const state = JSON.stringify({ role, joinCode });
    const encodedState = Buffer.from(state).toString("base64");
    
    const authUrl = googleClient.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      state: encodedState,
    });

    res.json({ authUrl });
  } catch (error) {
    console.error("Google OAuth initiation error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ 
      error: error.message || "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." 
    });
  }
});

// POST /auth/google/process-callback - Process OAuth callback from frontend
router.post("/google/process-callback", async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    // Process the callback (same logic as GET /google/callback)
    const result = await processGoogleCallback(code, state);
    
    if (result.redirect) {
      return res.json({ redirectTo: result.redirect });
    } else if (result.token) {
      return res.json({ 
        token: result.token, 
        user: result.user, 
        business: result.business 
      });
    } else {
      // Return error with message
      return res.status(400).json({ 
        error: result.error || "Failed to process OAuth callback",
        message: result.message || "Authentication failed"
      });
    }
  } catch (error) {
    console.error("Process callback error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to process Google OAuth callback
async function processGoogleCallback(code, state) {
  // Decode state
  let stateData = {};
  if (state) {
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch (e) {
      console.error("Failed to decode state:", e);
    }
  }

  // Get Google OAuth client
  const googleClient = getGoogleClient();

  // Exchange code for tokens
  let tokens;
  try {
    const tokenResponse = await googleClient.getToken(code);
    tokens = tokenResponse.tokens;
    googleClient.setCredentials(tokens);
  } catch (tokenError) {
    console.error("Error exchanging code for tokens:", tokenError);
    return { error: tokenError.message || "token_exchange_failed" };
  }

  if (!tokens.id_token) {
    return { error: "no_id_token" };
  }

  // Get user info from Google
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (verifyError) {
    console.error("Error verifying ID token:", verifyError);
    return { error: verifyError.message || "token_verification_failed" };
  }

  const googleEmail = payload.email;
  const googleName = payload.name;
  const googlePicture = payload.picture;

  if (!googleEmail) {
    return { error: "no_email" };
  }

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email: googleEmail },
    include: { business: true },
  });

  if (user) {
    // User exists, log them in
    const token = generateToken(user.id);
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      business: user.business ? {
        id: user.business.id,
        name: user.business.name,
        joinCode: user.business.joinCode,
      } : null,
    };
  }

  // New user - check if this is owner registration or employee join
  if (stateData.role === "OWNER") {
    // Owner registration - redirect to complete registration form
    const tempToken = jwt.sign(
      { 
        googleEmail, 
        googleName, 
        googlePicture,
        role: "OWNER",
        type: "google_owner_registration"
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );
    
    return { redirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/google/complete-owner?token=${tempToken}` };
  } else if (stateData.role === "EMPLOYEE") {
    // Employee trying to login but doesn't exist - show error
    return { error: "user_not_found", message: "Employee account not found. Please register first." };
  } else {
    // No role specified or unknown role - show error
    return { error: "user_not_found", message: "Account not found. Please register first." };
  }
}

// GET /auth/google/callback - Handle Google OAuth callback (for direct server redirects)
router.get("/google/callback", async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    // Check for OAuth errors from Google
    if (oauthError) {
      console.error("Google OAuth error:", oauthError);
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/welcome?error=oauth_failed&details=${encodeURIComponent(oauthError)}`
      );
    }

    if (!code) {
      console.error("No authorization code received from Google");
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/welcome?error=oauth_failed&details=no_code`);
    }

    // Use the helper function to process the callback
    const result = await processGoogleCallback(code, state);
    
    if (result.redirect) {
      return res.redirect(result.redirect);
    } else if (result.token) {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/google/success?token=${result.token}`
      );
    } else {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/welcome?error=oauth_failed&details=${encodeURIComponent(result.error || "unknown_error")}`
      );
    }
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/welcome?error=oauth_failed&details=${encodeURIComponent(error.message || "unknown_error")}`
    );
  }
});

// POST /auth/google/verify - Verify Google ID token (alternative method)
router.post("/google/verify", async (req, res) => {
  try {
    const { idToken, role, businessName, ownerName, joinCode } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "ID token is required" });
    }

    const googleClient = getGoogleClient();

    // Verify the token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleEmail = payload.email;
    const googleName = payload.name;

    if (!googleEmail) {
      return res.status(400).json({ error: "Email not provided by Google" });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleEmail },
      include: { business: true },
    });

    if (user) {
      // User exists, log them in
      const token = generateToken(user.id);
      return res.json({
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
    }

    // New user registration
    if (role === "OWNER" && businessName) {
      const generatedJoinCode = generateJoinCode();
      const result = await prisma.$transaction(async (tx) => {
        const owner = await tx.user.create({
          data: {
            email: googleEmail,
            name: ownerName || googleName,
            role: "OWNER",
            password: null,
          },
        });

        const business = await tx.business.create({
          data: {
            name: businessName,
            joinCode: generatedJoinCode,
            ownerUserId: owner.id,
            subscriptionStatus: "active",
          },
        });

        const updatedOwner = await tx.user.update({
          where: { id: owner.id },
          data: { businessId: business.id },
        });

        return { owner: updatedOwner, business };
      });

      try {
        await initializeBusinessDatabase(result.business.id);
      } catch (dbError) {
        console.error("Error initializing business database:", dbError);
      }

      const token = generateToken(result.owner.id);
      return res.json({
        token,
        user: {
          id: result.owner.id,
          name: result.owner.name,
          email: result.owner.email,
          role: result.owner.role,
        },
        business: {
          id: result.business.id,
          name: result.business.name,
          joinCode: result.business.joinCode,
        },
      });
    } else if (role === "EMPLOYEE" && joinCode) {
      const normalizedJoinCode = joinCode.trim().toUpperCase();
      const business = await prisma.business.findUnique({
        where: { joinCode: normalizedJoinCode },
      });

      if (!business) {
        return res.status(404).json({ error: "Invalid join code" });
      }

      const employee = await prisma.user.create({
        data: {
          email: googleEmail,
          name: googleName,
          role: "EMPLOYEE",
          businessId: business.id,
          password: null,
        },
      });

      const token = generateToken(employee.id);
      return res.json({
        token,
        user: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
        },
        business: {
          id: business.id,
          name: business.name,
          joinCode: business.joinCode,
        },
      });
    } else {
      return res.status(400).json({ error: "Invalid registration data" });
    }
  } catch (error) {
    console.error("Google token verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/google/complete-employee - Complete employee registration after Google OAuth
router.post("/google/complete-employee", async (req, res) => {
  try {
    const { tempToken, fullName, joinCode, phone } = req.body;

    if (!tempToken || !fullName || !joinCode) {
      return res.status(400).json({ error: "Token, full name, and join code are required" });
    }

    // Verify and decode temp token
    let googleData;
    try {
      googleData = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (googleData.type !== "google_employee_registration" || googleData.role !== "EMPLOYEE") {
        return res.status(400).json({ error: "Invalid registration token" });
      }
    } catch (error) {
      return res.status(400).json({ error: "Registration token expired or invalid. Please try again." });
    }

    const googleEmail = googleData.googleEmail;
    const googleName = googleData.googleName;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: googleEmail },
    });

    if (existingUser) {
      return res.status(400).json({ error: "This email is already registered. Please login instead." });
    }

    // Validate join code
    const normalizedJoinCode = joinCode.trim().toUpperCase();
    const business = await prisma.business.findUnique({
      where: { joinCode: normalizedJoinCode },
    });

    if (!business) {
      return res.status(400).json({ error: "Invalid join code. Please check and try again." });
    }

    // Create employee user
    const employee = await prisma.user.create({
      data: {
        email: googleEmail,
        name: fullName || googleName, // Use provided full name or fallback to Google name
        role: "EMPLOYEE",
        businessId: business.id,
        password: null, // No password for OAuth users
        // Note: phone is not in current schema, but we can add it later if needed
      },
    });

    // Generate auth token
    const token = generateToken(employee.id);

    res.json({
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
      business: {
        id: business.id,
        name: business.name,
        joinCode: business.joinCode,
      },
    });
  } catch (error) {
    console.error("Complete employee registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/google/complete-owner - Complete owner registration after Google OAuth
router.post("/google/complete-owner", async (req, res) => {
  try {
    const { tempToken, businessName, ownerName } = req.body;

    if (!tempToken || !businessName || !ownerName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Verify and decode temp token
    let googleData;
    try {
      googleData = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (googleData.type !== "google_owner_registration" || googleData.role !== "OWNER") {
        return res.status(400).json({ error: "Invalid registration token" });
      }
    } catch (error) {
      return res.status(400).json({ error: "Registration token expired or invalid. Please try again." });
    }

    const googleEmail = googleData.googleEmail;
    const googleName = googleData.googleName;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: googleEmail },
    });

    if (existingUser) {
      return res.status(400).json({ error: "This email is already registered. Please login instead." });
    }

    // Generate join code
    const joinCode = generateJoinCode();

    // Create owner and business
    const result = await prisma.$transaction(async (tx) => {
      // Create owner user
      const owner = await tx.user.create({
        data: {
          email: googleEmail,
          name: ownerName || googleName,
          role: "OWNER",
          password: null, // No password for OAuth users
        },
      });

      // Create business
      const business = await tx.business.create({
        data: {
          name: businessName,
          joinCode,
          ownerUserId: owner.id,
          subscriptionStatus: "active",
        },
      });

      // Update user with businessId
      const updatedOwner = await tx.user.update({
        where: { id: owner.id },
        data: { businessId: business.id },
      });

      return { owner: updatedOwner, business };
    });

    // Initialize business database
    try {
      await initializeBusinessDatabase(result.business.id);
    } catch (dbError) {
      console.error("Error initializing business database:", dbError);
    }

    // Generate auth token
    const token = generateToken(result.owner.id);

    res.json({
      token,
      user: {
        id: result.owner.id,
        name: result.owner.name,
        email: result.owner.email,
        role: result.owner.role,
      },
      business: {
        id: result.business.id,
        name: result.business.name,
        joinCode: result.business.joinCode,
      },
    });
  } catch (error) {
    console.error("Complete owner registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
