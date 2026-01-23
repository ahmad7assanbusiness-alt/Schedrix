import express from "express";
import { z } from "zod";
import prisma from "../prisma.js";
import { authMiddleware, managerOnly } from "../middleware/auth.js";

const router = express.Router();

const createScheduleSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  templateId: z.string().optional(), // Template ID to use
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

    const { startDate, endDate, templateId, rows, columns } = createScheduleSchema.parse(req.body);

    // If templateId provided, load from that template
    let templateRows = rows;
    let templateColumns = columns;
    let selectedTemplateId = templateId || null;
    
    if (templateId) {
      const template = await prisma.scheduleTemplate.findFirst({
        where: {
          id: templateId,
          businessId: req.user.businessId,
        },
      });
      
      if (template) {
        templateRows = rows !== undefined ? rows : (template.rows || null);
        templateColumns = columns !== undefined ? columns : (template.columns || null);
        selectedTemplateId = template.id;
      } else {
        return res.status(404).json({ error: "Template not found" });
      }
    } else if (!rows || !columns) {
      // Legacy: If no template specified and no rows/columns, try to find default template
      const defaultTemplate = await prisma.scheduleTemplate.findFirst({
        where: { businessId: req.user.businessId },
        orderBy: { createdAt: "desc" },
      });
      
      if (defaultTemplate) {
        templateRows = rows !== undefined ? rows : (defaultTemplate.rows || null);
        templateColumns = columns !== undefined ? columns : (defaultTemplate.columns || null);
        selectedTemplateId = defaultTemplate.id;
      }
    }

    const schedule = await prisma.scheduleWeek.create({
      data: {
        businessId: req.user.businessId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "DRAFT",
        createdByUserId: req.user.id,
        templateId: selectedTemplateId,
        rows: templateRows,
        columns: templateColumns,
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

    let whereClause = { businessId: req.user.businessId };

    // If user is an employee, filter by template assignments
    if (req.user.role === "EMPLOYEE") {
      // Get templates the employee is assigned to
      const templateAssignments = await prisma.templateEmployeeAssignment.findMany({
        where: { userId: req.user.id },
        select: { templateId: true },
      });

      const assignedTemplateIds = templateAssignments.map(ta => ta.templateId);

      if (assignedTemplateIds.length > 0) {
        // Only show published schedules that use templates the employee is assigned to
        whereClause = {
          ...whereClause,
          status: "PUBLISHED",
          templateId: { in: assignedTemplateIds },
        };
      } else {
        // If employee has no template assignments, show no schedules
        return res.json([]);
      }
    }

    // Add pagination (optional - backward compatible)
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    
    if (hasPagination) {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 per page
      const skip = (page - 1) * limit;

      const [schedules, total] = await Promise.all([
        prisma.scheduleWeek.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.scheduleWeek.count({ where: whereClause }),
      ]);

      return res.json({
        data: schedules,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Backward compatible: return array if no pagination params
    const schedules = await prisma.scheduleWeek.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    res.json(schedules);
  } catch (error) {
    console.error("List schedules error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /schedules/template (manager only - get schedule template)
router.get("/template", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const template = await prisma.scheduleTemplate.findUnique({
      where: { businessId: req.user.businessId },
    });

    res.json(template || null);
  } catch (error) {
    console.error("Get template error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /schedules/template (manager only - save schedule template)
router.put("/template", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const { rows, columns } = req.body;

    const template = await prisma.scheduleTemplate.upsert({
      where: { businessId: req.user.businessId },
      create: {
        businessId: req.user.businessId,
        rows: rows || null,
        columns: columns || null,
      },
      update: {
        rows: rows !== undefined ? rows : undefined,
        columns: columns !== undefined ? columns : undefined,
      },
    });

    res.json(template);
  } catch (error) {
    console.error("Save template error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Strict availability validation algorithm
 * Validates that an employee's availability entry matches exactly what they submitted
 * and is available for the requested shift type
 * 
 * CRITICAL: Employees marked as "off" must NEVER appear in available employees list
 */
function validateEmployeeAvailability(blocks, shiftType) {
  // Step 1: Validate blocks structure exists and is valid
  if (!blocks || typeof blocks !== "object") {
    return { valid: false, reason: "No availability data" };
  }

  // Step 2: CRITICAL - Multiple checks to ensure employees marked as "off" are excluded
  // Check for off in multiple ways to catch all edge cases
  if (blocks.off === true || blocks.off === "true" || blocks.off === 1) {
    return { valid: false, reason: "Employee marked as off/time off" };
  }

  // Additional safety: If off is truthy (even if not explicitly true), exclude
  if (blocks.off) {
    return { valid: false, reason: "Employee marked as off/time off (truthy check)" };
  }

  // Step 3: Exclude entries marked as NA (not available)
  if (blocks.na === true || blocks.na === "true" || blocks.na) {
    return { valid: false, reason: "Employee marked as NA" };
  }

  // Step 4: CRITICAL - When employee is off, morning and evening are typically false
  // Additional safety check: if off exists and morning/evening are both false, exclude
  if (blocks.off !== false && blocks.morning === false && blocks.evening === false && !blocks.double) {
    // This might be an off day, but we need to be careful not to exclude valid entries
    // Only exclude if off is explicitly true (already handled above)
  }

  // Step 5: Validate shift-specific availability
  // Employee must have EXPLICITLY marked themselves as available for the requested shift
  // ONLY proceed if they are NOT off and have the correct shift availability
  if (shiftType === "morning") {
    // For morning shift: must have morning=true OR double=true
    // Double means they're available for both shifts, so they qualify
    // MUST NOT be off
    if (blocks.off) {
      return { valid: false, reason: "Employee is off (morning check)" };
    }
    if (blocks.morning === true || blocks.double === true) {
      return { valid: true };
    }
    return { valid: false, reason: "Not available for morning shift" };
  } else if (shiftType === "evening") {
    // For evening shift: must have evening=true OR double=true
    // MUST NOT be off
    if (blocks.off) {
      return { valid: false, reason: "Employee is off (evening check)" };
    }
    if (blocks.evening === true || blocks.double === true) {
      return { valid: true };
    }
    return { valid: false, reason: "Not available for evening shift" };
  }

  // Step 6: Invalid shift type
  return { valid: false, reason: "Invalid shift type" };
}

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

    // Validate shift type
    if (shiftType !== "morning" && shiftType !== "evening") {
      return res.status(400).json({ error: "shiftType must be 'morning' or 'evening'" });
    }

    const targetDate = new Date(date);
    // Normalize date to start of day for proper comparison
    targetDate.setHours(0, 0, 0, 0);

    // Find availability requests that cover this date (check both OPEN and CLOSED)
    // Use the most recent request that covers this date
    const availabilityRequest = await prisma.availabilityRequest.findFirst({
      where: {
        businessId: req.user.businessId,
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
      orderBy: {
        createdAt: "desc", // Get the most recent request
      },
    });

    // Get ALL employees in the business first
    const allEmployees = await prisma.user.findMany({
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

    // If no availability request exists, return all employees (they didn't submit, assume available)
    if (!availabilityRequest) {
      console.log(`No availability request found, returning all ${allEmployees.length} employees`);
      return res.json(allEmployees);
    }

    // Get availability entries for this exact date
    // Use start/end of day to ensure we capture the correct date regardless of time
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await prisma.availabilityEntry.findMany({
      where: {
        requestId: availabilityRequest.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
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

    // Create a map of employee IDs to their availability blocks
    const availabilityMap = new Map();
    entries.forEach((entry) => {
      availabilityMap.set(entry.userId, entry.blocks);
    });

    // Filter all employees based on availability
    const availableEmployees = allEmployees.filter((employee) => {
      const blocks = availabilityMap.get(employee.id);
      
      // If employee didn't submit availability, include them (assume they're available)
      if (!blocks) {
        console.log(`✅ INCLUDING ${employee.name}: No availability entry (assumed available)`);
        return true;
      }

      // Employee submitted availability - validate it strictly
      if (typeof blocks !== "object") {
        console.log(`❌ EXCLUDING ${employee.name}: Invalid availability data`);
        return false;
      }

      // Log the blocks data for debugging
      if (process.env.NODE_ENV === "development") {
        console.log(`Checking ${employee.name} for ${shiftType} on ${date}:`, JSON.stringify(blocks));
      }

      const validation = validateEmployeeAvailability(blocks, shiftType);

      // Log excluded employees for debugging
      if (!validation.valid) {
        console.log(`❌ EXCLUDING ${employee.name}: ${validation.reason}`, {
          off: blocks?.off,
          morning: blocks?.morning,
          evening: blocks?.evening,
          double: blocks?.double,
        });
      } else {
        console.log(`✅ INCLUDING ${employee.name}: Available for ${shiftType}`);
      }

      return validation.valid;
    });

    console.log(`Returning ${availableEmployees.length} available employees for ${shiftType} on ${date} (out of ${allEmployees.length} total)`);

    // Return employees who are available
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

// POST /schedules/:id/unpublish (manager only - change PUBLISHED back to DRAFT for editing)
router.post("/:id/unpublish", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const schedule = await prisma.scheduleWeek.updateMany({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
        status: "PUBLISHED", // Only allow unpublishing published schedules
      },
      data: { status: "DRAFT" },
    });

    if (schedule.count === 0) {
      return res.status(404).json({ error: "Schedule not found or not published" });
    }

    const updated = await prisma.scheduleWeek.findUnique({
      where: { id: req.params.id },
    });

    res.json(updated);
  } catch (error) {
    console.error("Unpublish schedule error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const updateScheduleStructureSchema = z.object({
  rows: z.array(z.string()).nullable().optional(),
  columns: z.array(z.object({
    label: z.string(),
    date: z.string().datetime().nullable().optional(),
  })).nullable().optional(),
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

