import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { business: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      id: user.id,
      role: user.role,
      businessId: user.businessId,
    };

    next();
  } catch (error) {
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

