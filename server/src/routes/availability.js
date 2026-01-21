import express from "express";
import { z } from "zod";
import prisma from "../prisma.js";
import { authMiddleware, managerOnly, employeeOnly } from "../middleware/auth.js";

const router = express.Router();

/**
 * Calculate next dates based on frequency
 */
function calculateNextDates(startDate, endDate, frequency) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = end.getTime() - start.getTime(); // Duration in milliseconds

  let nextStart, nextEnd;
  if (frequency === "WEEKLY") {
    nextStart = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000); // Add 7 days
    nextEnd = new Date(nextStart.getTime() + duration);
  } else if (frequency === "BIWEEKLY") {
    nextStart = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000); // Add 14 days
    nextEnd = new Date(nextStart.getTime() + duration);
  } else if (frequency === "MONTHLY") {
    nextStart = new Date(start);
    nextStart.setMonth(nextStart.getMonth() + 1); // Add 1 month
    nextEnd = new Date(end);
    nextEnd.setMonth(nextEnd.getMonth() + 1); // Add 1 month
  } else {
    return null;
  }

  return { nextStart, nextEnd };
}

/**
 * Create recurring availability requests and schedules
 * Creates up to 12 future requests (approximately 3 months for weekly)
 */
async function createRecurringRequests(originalRequest, originalSchedule, tx, maxRequests = 12) {
  if (!originalRequest.frequency) return [];

  const created = [];
  let currentStart = new Date(originalRequest.startDate);
  let currentEnd = new Date(originalRequest.endDate);
  let iteration = 0;

  while (iteration < maxRequests) {
    const nextDates = calculateNextDates(currentStart, currentEnd, originalRequest.frequency);
    if (!nextDates) break;

    // Don't create requests too far in the future (stop at 6 months ahead)
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    if (nextDates.nextStart > sixMonthsFromNow) break;

    // Create next availability request
    const nextRequest = await tx.availabilityRequest.create({
      data: {
        businessId: originalRequest.businessId,
        startDate: nextDates.nextStart,
        endDate: nextDates.nextEnd,
        status: "CLOSED", // Future requests start as CLOSED until they're ready
        frequency: originalRequest.frequency,
        createdByUserId: originalRequest.createdByUserId,
      },
    });

    // Create corresponding schedule
    await tx.scheduleWeek.create({
      data: {
        businessId: originalRequest.businessId,
        startDate: nextDates.nextStart,
        endDate: nextDates.nextEnd,
        status: "DRAFT",
        createdByUserId: originalRequest.createdByUserId,
        availabilityRequestId: nextRequest.id,
        rows: originalSchedule.rows,
        columns: originalSchedule.columns,
      },
    });

    created.push(nextRequest);
    currentStart = nextDates.nextStart;
    currentEnd = nextDates.nextEnd;
    iteration++;
  }

  return created;
}

const createRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]).optional(),
});

const submitEntriesSchema = z.object({
  requestId: z.string(),
  entries: z.array(
    z.object({
      date: z.string().datetime(),
      off: z.boolean().optional(),
      morning: z.boolean().optional(),
      evening: z.boolean().optional(),
      double: z.boolean().optional(),
      morningStartTime: z.string().optional(),
      morningEndTime: z.string().optional(),
      eveningStartTime: z.string().optional(),
      eveningEndTime: z.string().optional(),
    })
  ),
});

// POST /availability-requests (manager only)
router.post("/", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const { startDate, endDate, frequency } = createRequestSchema.parse(req.body);

    // Close any existing OPEN requests for this business
    await prisma.availabilityRequest.updateMany({
      where: {
        businessId: req.user.businessId,
        status: "OPEN",
      },
      data: { status: "CLOSED" },
    });

    // Use transaction to create request and schedule atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create availability request
      const request = await tx.availabilityRequest.create({
        data: {
          businessId: req.user.businessId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: "OPEN",
          frequency: frequency || null,
          createdByUserId: req.user.id,
        },
      });

      // Load schedule template if it exists
      const template = await tx.scheduleTemplate.findUnique({
        where: { businessId: req.user.businessId },
      });

      // Automatically create schedule for the same dates
      const schedule = await tx.scheduleWeek.create({
        data: {
          businessId: req.user.businessId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: "DRAFT",
          createdByUserId: req.user.id,
          availabilityRequestId: request.id,
          rows: template?.rows || null,
          columns: template?.columns || null,
        },
      });

      // If frequency is set, create recurring requests and schedules
      let recurringRequests = [];
      if (frequency) {
        recurringRequests = await createRecurringRequests(request, schedule, tx);
      }

      return { request, schedule, recurringRequests };
    });

    // Return request with schedule info
    res.json({
      ...result.request,
      scheduleId: result.schedule.id,
      recurringRequestsCreated: result.recurringRequests.length,
    });
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
      // Determine shift types
      const isOff = entry.off === true;
      const isDouble = entry.double === true;
      const isMorning = entry.morning === true || isDouble;
      const isEvening = entry.evening === true || isDouble;

      // Build blocks object with time slots
      const blocks = {
        off: isOff,
        morning: isMorning,
        evening: isEvening,
        double: isDouble,
        morningStartTime: isOff ? null : (entry.morningStartTime || null),
        morningEndTime: isOff ? null : (entry.morningEndTime || null),
        eveningStartTime: isOff ? null : (entry.eveningStartTime || null),
        eveningEndTime: isOff ? null : (entry.eveningEndTime || null),
      };

      const result = await prisma.availabilityEntry.upsert({
        where: {
          requestId_userId_date: {
            requestId,
            userId: req.user.id,
            date: new Date(entry.date),
          },
        },
        update: {
          blocks,
        },
        create: {
          requestId,
          userId: req.user.id,
          date: new Date(entry.date),
          blocks,
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

