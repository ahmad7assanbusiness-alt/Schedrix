import { getBusinessDb } from "../db/businessDb.js";

// Cache BusinessDb instances per business
const businessDbCache = new Map();

/**
 * Middleware to attach business-specific database to request
 * Requires authMiddleware to run first (to set req.user)
 */
export function businessDbMiddleware(req, res, next) {
  // Get businessId from user
  const businessId = req.user?.businessId;
  
  if (!businessId) {
    return res.status(400).json({ error: "User is not associated with a business" });
  }

  // Get or create BusinessDb instance for this business
  if (!businessDbCache.has(businessId)) {
    businessDbCache.set(businessId, getBusinessDb(businessId));
  }

  // Attach to request
  req.businessDb = businessDbCache.get(businessId);
  
  next();
}
