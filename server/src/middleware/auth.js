import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("[DEBUG] authMiddleware - authHeader present:", !!authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[DEBUG] authMiddleware - no auth header or invalid format");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    console.log("[DEBUG] authMiddleware - token extracted, length:", token.length);
    console.log("[DEBUG] authMiddleware - JWT_SECRET present:", !!process.env.JWT_SECRET);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[DEBUG] authMiddleware - token verified, userId:", decoded.userId);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { business: true },
    });

    if (!user) {
      console.error("[DEBUG] authMiddleware - user not found for userId:", decoded.userId);
      return res.status(401).json({ error: "User not found" });
    }

    console.log("[DEBUG] authMiddleware - user found:", user.email);
    req.user = {
      id: user.id,
      role: user.role,
      businessId: user.businessId,
    };

    next();
  } catch (error) {
    console.error("[DEBUG] authMiddleware - error:", error.message, error.name);
    if (error.name === "JsonWebTokenError") {
      console.error("[DEBUG] authMiddleware - JWT error details:", error.message);
    } else if (error.name === "TokenExpiredError") {
      console.error("[DEBUG] authMiddleware - Token expired");
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const managerOnly = (req, res, next) => {
  if (req.user.role !== "OWNER" && req.user.role !== "MANAGER") {
    return res.status(403).json({ error: "Manager access required" });
  }
  next();
};

export const employeeOnly = (req, res, next) => {
  if (req.user.role !== "EMPLOYEE") {
    return res.status(403).json({ error: "Employee access required" });
  }
  next();
};

