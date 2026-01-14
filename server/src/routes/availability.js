import express from "express";
import { z } from "zod";
import prisma from "../prisma.js";
import { authMiddleware, managerOnly, employeeOnly } from "../middleware/auth.js";

const router = express.Router();

const createRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const submitEntriesSchema = z.object({
  requestId: z.string(),
  entries: z.array(
    z.object({
      date: z.string().datetime(),
      morning: z.boolean(),
      evening: z.boolean(),
    })
  ),
});

// POST /availability-requests (manager only)
router.post("/", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const { startDate, endDate } = createRequestSchema.parse(req.body);

    // Close any existing OPEN requests for this business
    await prisma.availabilityRequest.updateMany({
      where: {
        businessId: req.user.businessId,
        status: "OPEN",
      },
      data: { status: "CLOSED" },
    });

    const request = await prisma.availabilityRequest.create({
      data: {
        businessId: req.user.businessId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "OPEN",
        createdByUserId: req.user.id,
      },
    });

    res.json(request);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Create request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /availability-requests/open
router.get("/open", authMiddleware, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.json(null);
    }

    const request = await prisma.availabilityRequest.findFirst({
      where: {
        businessId: req.user.businessId,
        status: "OPEN",
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(request);
  } catch (error) {
    console.error("Get open request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /availability-requests (manager only - list all)
router.get("/", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const requests = await prisma.availabilityRequest.findMany({
      where: { businessId: req.user.businessId },
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  } catch (error) {
    console.error("List requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /availability-entries (employee only)
router.post("/entries", authMiddleware, employeeOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const { requestId, entries } = submitEntriesSchema.parse(req.body);

    // Verify request belongs to user's business
    const request = await prisma.availabilityRequest.findFirst({
      where: {
        id: requestId,
        businessId: req.user.businessId,
        status: "OPEN",
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found or closed" });
    }

    // Upsert entries
    const results = [];
    for (const entry of entries) {
      const result = await prisma.availabilityEntry.upsert({
        where: {
          requestId_userId_date: {
            requestId,
            userId: req.user.id,
            date: new Date(entry.date),
          },
        },
        update: {
          blocks: { morning: entry.morning, evening: entry.evening },
        },
        create: {
          requestId,
          userId: req.user.id,
          date: new Date(entry.date),
          blocks: { morning: entry.morning, evening: entry.evening },
        },
      });
      results.push(result);
    }

    res.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Submit entries error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /availability-requests/:id/entries (manager only)
router.get("/:id/entries", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const request = await prisma.availabilityRequest.findFirst({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
      },
      include: {
        entries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json(request.entries);
  } catch (error) {
    console.error("Get entries error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

