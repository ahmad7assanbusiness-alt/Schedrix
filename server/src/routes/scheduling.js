import express from "express";
import { z } from "zod";
import prisma from "../prisma.js";
import { authMiddleware, managerOnly } from "../middleware/auth.js";

const router = express.Router();

const createScheduleSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  rows: z.array(z.string()).optional(), // Array of row labels (positions)
  columns: z.array(z.object({
    label: z.string(),
    date: z.string().datetime().optional(), // Optional date for date-based columns
  })).optional(), // Array of column definitions
});

const assignmentSchema = z.object({
  date: z.string().datetime(),
  position: z.string().min(1, "Position is required"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  shiftType: z.enum(["morning", "evening"]).optional().default("morning"),
  assignedUserId: z.string().nullable().optional(),
});

// POST /schedules (manager only)
router.post("/", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const { startDate, endDate, rows, columns } = createScheduleSchema.parse(req.body);

    const schedule = await prisma.scheduleWeek.create({
      data: {
        businessId: req.user.businessId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "DRAFT",
        createdByUserId: req.user.id,
        rows: rows || null,
        columns: columns || null,
      },
    });

    res.json(schedule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Create schedule error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /schedules (auth - list schedules for business)
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const schedules = await prisma.scheduleWeek.findMany({
      where: { businessId: req.user.businessId },
      orderBy: { createdAt: "desc" },
    });

    res.json(schedules);
  } catch (error) {
    console.error("List schedules error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /schedules/:id/available-employees?date=YYYY-MM-DD&shiftType=morning|evening
router.get("/:id/available-employees", authMiddleware, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const schedule = await prisma.scheduleWeek.findFirst({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const { date, shiftType } = req.query;
    if (!date || !shiftType) {
      return res.status(400).json({ error: "Date and shiftType are required" });
    }

    const targetDate = new Date(date);
    const dateStr = targetDate.toISOString().split("T")[0];

    // Find open availability requests that cover this date
    const availabilityRequest = await prisma.availabilityRequest.findFirst({
      where: {
        businessId: req.user.businessId,
        status: "OPEN",
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
    });

    if (!availabilityRequest) {
      // If no availability request, return all employees
      const allUsers = await prisma.user.findMany({
        where: {
          businessId: req.user.businessId,
          role: "EMPLOYEE",
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      return res.json(allUsers);
    }

    // Get availability entries for this date
    const entries = await prisma.availabilityEntry.findMany({
      where: {
        requestId: availabilityRequest.id,
        date: targetDate,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Filter employees based on shift type
    const availableEmployees = entries
      .filter((entry) => {
        const blocks = entry.blocks;
        if (!blocks || blocks.off === true) return false; // Exclude off/NA
        
        if (shiftType === "morning") {
          return blocks.morning === true || blocks.double === true;
        } else if (shiftType === "evening") {
          return blocks.evening === true || blocks.double === true;
        }
        return false;
      })
      .map((entry) => entry.user);

    res.json(availableEmployees);
  } catch (error) {
    console.error("Get available employees error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /schedules/:id (auth - get schedule with assignments)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const schedule = await prisma.scheduleWeek.findFirst({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
      },
      include: {
        assignments: {
          include: {
            assignedUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Get business users
    const users = await prisma.user.findMany({
      where: { businessId: req.user.businessId },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    res.json({
      ...schedule,
      users,
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /schedules/:id/assignments (manager only - create assignment)
router.post("/:id/assignments", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const schedule = await prisma.scheduleWeek.findFirst({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const { date, position, startTime, endTime, shiftType, assignedUserId } = assignmentSchema.parse(req.body);

    // If assigning to a user, verify they're in the business
    if (assignedUserId) {
      const user = await prisma.user.findFirst({
        where: {
          id: assignedUserId,
          businessId: req.user.businessId,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found in business" });
      }
    }

    // Create assignment (allow multiple per day/position/shift)
    const assignment = await prisma.shiftAssignment.create({
      data: {
        scheduleId: req.params.id,
        date: new Date(date),
        position,
        startTime: startTime || "09:00",
        endTime: endTime || "17:00",
        shiftType: shiftType || "morning",
        assignedUserId: assignedUserId || null,
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(assignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Create assignment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /schedules/:id/assignments/:assignmentId (manager only - update assignment)
router.put("/:id/assignments/:assignmentId", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const schedule = await prisma.scheduleWeek.findFirst({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const assignment = await prisma.shiftAssignment.findFirst({
      where: {
        id: req.params.assignmentId,
        scheduleId: req.params.id,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const updateData = {};
    if (req.body.position !== undefined) updateData.position = req.body.position;
    if (req.body.startTime !== undefined) updateData.startTime = req.body.startTime;
    if (req.body.endTime !== undefined) updateData.endTime = req.body.endTime;
    if (req.body.shiftType !== undefined) updateData.shiftType = req.body.shiftType;
    if (req.body.date !== undefined) updateData.date = new Date(req.body.date);
    if (req.body.assignedUserId !== undefined) {
      if (req.body.assignedUserId) {
        const user = await prisma.user.findFirst({
          where: {
            id: req.body.assignedUserId,
            businessId: req.user.businessId,
          },
        });
        if (!user) {
          return res.status(404).json({ error: "User not found in business" });
        }
      }
      updateData.assignedUserId = req.body.assignedUserId || null;
    }

    const updated = await prisma.shiftAssignment.update({
      where: { id: req.params.assignmentId },
      data: updateData,
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update assignment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /schedules/:id/assignments/:assignmentId (manager only - delete assignment)
router.delete("/:id/assignments/:assignmentId", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const schedule = await prisma.scheduleWeek.findFirst({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const assignment = await prisma.shiftAssignment.findFirst({
      where: {
        id: req.params.assignmentId,
        scheduleId: req.params.id,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    await prisma.shiftAssignment.delete({
      where: { id: req.params.assignmentId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /schedules/:id/publish (manager only)
router.post("/:id/publish", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const schedule = await prisma.scheduleWeek.updateMany({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
      },
      data: { status: "PUBLISHED" },
    });

    if (schedule.count === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const updated = await prisma.scheduleWeek.findUnique({
      where: { id: req.params.id },
    });

    res.json(updated);
  } catch (error) {
    console.error("Publish schedule error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const updateScheduleStructureSchema = z.object({
  rows: z.array(z.string()).optional(),
  columns: z.array(z.object({
    label: z.string(),
    date: z.string().datetime().optional(),
  })).optional(),
});

// PUT /schedules/:id/structure (manager only - update rows and columns)
router.put("/:id/structure", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const schedule = await prisma.scheduleWeek.findFirst({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const { rows, columns } = updateScheduleStructureSchema.parse(req.body);

    const updated = await prisma.scheduleWeek.update({
      where: { id: req.params.id },
      data: {
        rows: rows !== undefined ? rows : schedule.rows,
        columns: columns !== undefined ? columns : schedule.columns,
      },
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Update schedule structure error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /schedules/:id (manager only - delete draft schedule)
router.delete("/:id", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const schedule = await prisma.scheduleWeek.findFirst({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
        status: "DRAFT", // Only allow deleting draft schedules
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Draft schedule not found" });
    }

    // Delete all assignments first
    await prisma.shiftAssignment.deleteMany({
      where: { scheduleId: req.params.id },
    });

    // Delete the schedule
    await prisma.scheduleWeek.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Delete schedule error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

