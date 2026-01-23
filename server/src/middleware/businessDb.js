import { getBusinessDb } from "../db/businessDb.js";

// Cache BusinessDb instances per business with TTL
const businessDbCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Cleanup function to remove stale entries
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [businessId, cacheEntry] of businessDbCache.entries()) {
    if (now - cacheEntry.lastUsed > CACHE_TTL) {
      businessDbCache.delete(businessId);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`[Cache Cleanup] Cleared ${cleaned} stale BusinessDb cache entries`);
  }
}, 10 * 60 * 1000); // Run cleanup every 10 minutes

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

  // Get or create BusinessDb instance
  if (!businessDbCache.has(businessId)) {
    businessDbCache.set(businessId, {
      instance: getBusinessDb(businessId),
      lastUsed: Date.now(),
    });
  } else {
    // Update last used time
    businessDbCache.get(businessId).lastUsed = Date.now();
  }

  // Attach to request
  req.businessDb = businessDbCache.get(businessId).instance;
  
  next();
}
