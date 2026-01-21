import express from "express";
import { z } from "zod";
import prisma from "../prisma.js";
import { authMiddleware, managerOnly } from "../middleware/auth.js";

const router = express.Router();

const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").optional().nullable(),
  rows: z.array(z.string()).optional().nullable(),
  columns: z.array(z.object({
    label: z.string(),
    date: z.string().datetime().optional(),
  })).optional().nullable(),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  rows: z.array(z.string()).optional().nullable(),
  columns: z.array(z.object({
    label: z.string(),
    date: z.string().datetime().optional(),
  })).optional().nullable(),
});

// GET /templates (manager only - list all templates)
router.get("/", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const templates = await prisma.scheduleTemplate.findMany({
      where: { businessId: req.user.businessId },
      include: {
        assignedEmployees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(templates);
  } catch (error) {
    console.error("Get templates error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /templates/:id (manager only - get single template)
router.get("/:id", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const template = await prisma.scheduleTemplate.findFirst({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
      },
      include: {
        assignedEmployees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json(template);
  } catch (error) {
    console.error("Get template error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /templates (manager only - create template)
router.post("/", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const { name, rows, columns } = createTemplateSchema.parse(req.body);

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Template name is required" });
    }

    // Remove dates from columns when saving template
    const templateColumns = columns
      ? columns.map(col => ({ label: col.label }))
      : null;

    const template = await prisma.scheduleTemplate.create({
      data: {
        businessId: req.user.businessId,
        name: name.trim(),
        rows: rows || null,
        columns: templateColumns,
      },
    });

    res.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Create template error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /templates/:id (manager only - update template)
router.put("/:id", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const template = await prisma.scheduleTemplate.findFirst({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
      },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const data = updateTemplateSchema.parse(req.body);
    
    // Remove dates from columns if updating
    if (data.columns) {
      data.columns = data.columns.map(col => ({ label: col.label }));
    }

    const updated = await prisma.scheduleTemplate.update({
      where: { id: req.params.id },
      data,
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Update template error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /templates/:id (manager only - delete template)
router.delete("/:id", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const template = await prisma.scheduleTemplate.findFirst({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
      },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    await prisma.scheduleTemplate.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Delete template error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /templates/:id/assign-employees (manager only - assign employees to template)
router.post("/:id/assign-employees", authMiddleware, managerOnly, async (req, res) => {
  try {
    if (!req.user.businessId) {
      return res.status(403).json({ error: "Not part of a business" });
    }

    const template = await prisma.scheduleTemplate.findFirst({
      where: {
        id: req.params.id,
        businessId: req.user.businessId,
      },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const { userIds } = req.body;
    
    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: "userIds must be an array" });
    }

    // Verify all users belong to the business
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        businessId: req.user.businessId,
        role: "EMPLOYEE",
      },
    });

    if (users.length !== userIds.length) {
      return res.status(400).json({ error: "Some users not found or not employees" });
    }

    // Delete existing assignments
    await prisma.templateEmployeeAssignment.deleteMany({
      where: { templateId: req.params.id },
    });

    // Create new assignments
    if (userIds.length > 0) {
      await prisma.templateEmployeeAssignment.createMany({
        data: userIds.map(userId => ({
          templateId: req.params.id,
          userId,
        })),
      });
    }

    const updated = await prisma.scheduleTemplate.findFirst({
      where: { id: req.params.id },
      include: {
        assignedEmployees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Assign employees error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
