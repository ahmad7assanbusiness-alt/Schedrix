import { Prisma } from "@prisma/client";
import prisma from "../prisma.js";
import { getBusinessSchemaName } from "./schemaManager.js";

/**
 * Business-specific database operations
 * All queries are executed in the business's dedicated schema
 */
export class BusinessDb {
  constructor(businessId) {
    this.businessId = businessId;
    this.schemaName = getBusinessSchemaName(businessId);
  }

  /**
   * Execute a raw query in the business schema
   * Uses Prisma.sql for safe parameterization
   * Schema name is safely interpolated (we control it via businessId)
   */
  async query(sqlTemplate, params = []) {
    // Replace table names with schema-qualified names using Prisma.raw
    // This is safe because schemaName is derived from validated businessId
    const schemaQualifiedParts = this._qualifyTables(sqlTemplate, params);
    return prisma.$queryRaw(Prisma.sql(schemaQualifiedParts));
  }

  /**
   * Qualify table names with schema and convert $1, $2 to Prisma.sql format
   */
  _qualifyTables(sqlTemplate, params) {
    const parts = [];
    let sql = sqlTemplate;
    let lastIndex = 0;
    
    // First, replace table names with schema-qualified versions
    sql = sql
      .replace(/"AvailabilityRequest"/g, `"${this.schemaName}"."AvailabilityRequest"`)
      .replace(/"AvailabilityEntry"/g, `"${this.schemaName}"."AvailabilityEntry"`)
      .replace(/"ScheduleWeek"/g, `"${this.schemaName}"."ScheduleWeek"`)
      .replace(/"ShiftAssignment"/g, `"${this.schemaName}"."ShiftAssignment"`)
      .replace(/"ScheduleTemplate"/g, `"${this.schemaName}"."ScheduleTemplate"`)
      .replace(/"TemplateEmployeeAssignment"/g, `"${this.schemaName}"."TemplateEmployeeAssignment"`)
      .replace(/"CalendarIntegration"/g, `"${this.schemaName}"."CalendarIntegration"`);
    
    // Now convert $1, $2, etc. to Prisma.sql parameters
    const regex = /\$(\d+)/g;
    let match;
    
    while ((match = regex.exec(sql)) !== null) {
      const paramNum = parseInt(match[1]) - 1;
      if (paramNum >= 0 && paramNum < params.length) {
        // Add text before parameter
        if (lastIndex < match.index) {
          parts.push(Prisma.raw(sql.substring(lastIndex, match.index)));
        }
        // Add parameter value
        parts.push(params[paramNum]);
        lastIndex = match.index + match[0].length;
      }
    }
    
    // Add remaining text
    if (lastIndex < sql.length) {
      parts.push(Prisma.raw(sql.substring(lastIndex)));
    }
    
    return parts.length > 0 ? parts : [Prisma.raw(sql)];
  }

  /**
   * Execute a raw command (INSERT, UPDATE, DELETE)
   */
  async execute(sqlTemplate, params = []) {
    const schemaQualifiedParts = this._qualifyTables(sqlTemplate, params);
    return prisma.$executeRaw(Prisma.sql(schemaQualifiedParts));
  }

  // Availability Request operations
  async createAvailabilityRequest(data) {
    const sql = `
      INSERT INTO "AvailabilityRequest" 
      (id, "startDate", "endDate", status, frequency, "createdByUserId", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    return this.query(sql, [
      data.id,
      data.startDate,
      data.endDate,
      data.status || "OPEN",
      data.frequency || null,
      data.createdByUserId,
    ]);
  }

  async getAvailabilityRequests(filters = {}) {
    let sql = `SELECT * FROM "AvailabilityRequest" WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }
    if (filters.createdByUserId) {
      sql += ` AND "createdByUserId" = $${paramIndex++}`;
      params.push(filters.createdByUserId);
    }

    sql += ` ORDER BY "createdAt" DESC`;
    return this.query(sql, params);
  }

  async getAvailabilityRequestById(id) {
    const sql = `SELECT * FROM "AvailabilityRequest" WHERE id = $1`;
    const result = await this.query(sql, [id]);
    return result[0] || null;
  }

  // Availability Entry operations
  async createAvailabilityEntry(data) {
    const sql = `
      INSERT INTO "AvailabilityEntry"
      (id, "requestId", "userId", date, blocks, note, "createdAt")
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, NOW())
      ON CONFLICT ("requestId", "userId", date) 
      DO UPDATE SET blocks = $5::jsonb, note = $6
      RETURNING *
    `;
    return this.query(sql, [
      data.id,
      data.requestId,
      data.userId,
      data.date,
      JSON.stringify(data.blocks),
      data.note || null,
    ]);
  }

  async getAvailabilityEntries(requestId) {
    const sql = `SELECT * FROM "AvailabilityEntry" WHERE "requestId" = $1 ORDER BY date, "userId"`;
    return this.query(sql, [requestId]);
  }

  // Schedule operations
  async createSchedule(data) {
    const sql = `
      INSERT INTO "ScheduleWeek"
      (id, "startDate", "endDate", status, "createdByUserId", "availabilityRequestId", "templateId", rows, columns, "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, NOW())
      RETURNING *
    `;
    return this.query(sql, [
      data.id,
      data.startDate,
      data.endDate,
      data.status || "DRAFT",
      data.createdByUserId,
      data.availabilityRequestId || null,
      data.templateId || null,
      data.rows ? JSON.stringify(data.rows) : null,
      data.columns ? JSON.stringify(data.columns) : null,
    ]);
  }

  async getSchedules(filters = {}) {
    let sql = `SELECT * FROM "ScheduleWeek" WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }
    if (filters.createdByUserId) {
      sql += ` AND "createdByUserId" = $${paramIndex++}`;
      params.push(filters.createdByUserId);
    }

    sql += ` ORDER BY "startDate" DESC`;
    return this.query(sql, params);
  }

  async getScheduleById(id) {
    const sql = `SELECT * FROM "ScheduleWeek" WHERE id = $1`;
    const result = await this.query(sql, [id]);
    return result[0] || null;
  }

  async updateSchedule(id, data) {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(data.status);
    }
    if (data.rows !== undefined) {
      updates.push(`rows = $${paramIndex++}::jsonb`);
      params.push(JSON.stringify(data.rows));
    }
    if (data.columns !== undefined) {
      updates.push(`columns = $${paramIndex++}::jsonb`);
      params.push(JSON.stringify(data.columns));
    }

    if (updates.length === 0) return null;

    updates.push(`"updatedAt" = NOW()`);
    params.push(id);

    const sql = `UPDATE "ScheduleWeek" SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    const result = await this.query(sql, params);
    return result[0] || null;
  }

  // Shift Assignment operations
  async createShiftAssignment(data) {
    const sql = `
      INSERT INTO "ShiftAssignment"
      (id, "scheduleId", date, "startTime", "endTime", position, "shiftType", "assignedUserId", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;
    return this.query(sql, [
      data.id,
      data.scheduleId,
      data.date,
      data.startTime || "09:00",
      data.endTime || "17:00",
      data.position,
      data.shiftType || "morning",
      data.assignedUserId || null,
    ]);
  }

  async getShiftAssignments(scheduleId) {
    const sql = `SELECT * FROM "ShiftAssignment" WHERE "scheduleId" = $1 ORDER BY date, position`;
    return this.query(sql, [scheduleId]);
  }

  async updateShiftAssignment(id, data) {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (data.assignedUserId !== undefined) {
      updates.push(`"assignedUserId" = $${paramIndex++}`);
      params.push(data.assignedUserId);
    }
    if (data.startTime !== undefined) {
      updates.push(`"startTime" = $${paramIndex++}`);
      params.push(data.startTime);
    }
    if (data.endTime !== undefined) {
      updates.push(`"endTime" = $${paramIndex++}`);
      params.push(data.endTime);
    }

    if (updates.length === 0) return null;

    params.push(id);
    const sql = `UPDATE "ShiftAssignment" SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    const result = await this.query(sql, params);
    return result[0] || null;
  }

  async deleteShiftAssignment(id) {
    const sql = `DELETE FROM "ShiftAssignment" WHERE id = $1 RETURNING *`;
    const result = await this.query(sql, [id]);
    return result[0] || null;
  }

  // Template operations
  async createTemplate(data) {
    const sql = `
      INSERT INTO "ScheduleTemplate"
      (id, name, rows, columns, "createdAt", "updatedAt")
      VALUES ($1, $2, $3::jsonb, $4::jsonb, NOW(), NOW())
      RETURNING *
    `;
    return this.query(sql, [
      data.id,
      data.name || null,
      data.rows ? JSON.stringify(data.rows) : null,
      data.columns ? JSON.stringify(data.columns) : null,
    ]);
  }

  async getTemplates() {
    const sql = `SELECT * FROM "ScheduleTemplate" ORDER BY "createdAt" DESC`;
    return this.query(sql, []);
  }

  async getTemplateById(id) {
    const sql = `SELECT * FROM "ScheduleTemplate" WHERE id = $1`;
    const result = await this.query(sql, [id]);
    return result[0] || null;
  }

  async updateTemplate(id, data) {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.rows !== undefined) {
      updates.push(`rows = $${paramIndex++}::jsonb`);
      params.push(JSON.stringify(data.rows));
    }
    if (data.columns !== undefined) {
      updates.push(`columns = $${paramIndex++}::jsonb`);
      params.push(JSON.stringify(data.columns));
    }

    if (updates.length === 0) return null;

    updates.push(`"updatedAt" = NOW()`);
    params.push(id);

    const sql = `UPDATE "ScheduleTemplate" SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    const result = await this.query(sql, params);
    return result[0] || null;
  }

  async deleteTemplate(id) {
    const sql = `DELETE FROM "ScheduleTemplate" WHERE id = $1 RETURNING *`;
    const result = await this.query(sql, [id]);
    return result[0] || null;
  }

  // Template Employee Assignment operations
  async assignEmployeeToTemplate(templateId, userId) {
    const { randomUUID } = await import("crypto");
    const id = randomUUID();
    const sql = `
      INSERT INTO "TemplateEmployeeAssignment" (id, "templateId", "userId", "createdAt")
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT ("templateId", "userId") DO NOTHING
      RETURNING *
    `;
    const result = await this.query(sql, [id, templateId, userId]);
    return result[0] || null;
  }

  async unassignEmployeeFromTemplate(templateId, userId) {
    const sql = `DELETE FROM "TemplateEmployeeAssignment" WHERE "templateId" = $1 AND "userId" = $2 RETURNING *`;
    const result = await this.query(sql, [templateId, userId]);
    return result[0] || null;
  }

  async getTemplateAssignments(templateId) {
    const sql = `SELECT * FROM "TemplateEmployeeAssignment" WHERE "templateId" = $1`;
    return this.query(sql, [templateId]);
  }

  async getEmployeeTemplates(userId) {
    const sql = `SELECT "templateId" FROM "TemplateEmployeeAssignment" WHERE "userId" = $1`;
    return this.query(sql, [userId]);
  }

  // Calendar Integration operations
  async createCalendarIntegration(data) {
    const sql = `
      INSERT INTO "CalendarIntegration"
      (id, "userId", provider, "accessToken", "refreshToken", "calendarId", enabled, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT ("userId", provider) 
      DO UPDATE SET "accessToken" = $4, "refreshToken" = $5, "calendarId" = $6, enabled = $7, "updatedAt" = NOW()
      RETURNING *
    `;
    return this.query(sql, [
      data.id,
      data.userId,
      data.provider,
      data.accessToken || null,
      data.refreshToken || null,
      data.calendarId || null,
      data.enabled !== false,
    ]);
  }

  async getCalendarIntegrations(userId) {
    const sql = `SELECT * FROM "CalendarIntegration" WHERE "userId" = $1 ORDER BY "createdAt" DESC`;
    return this.query(sql, [userId]);
  }

  async deleteCalendarIntegration(id, userId) {
    const sql = `DELETE FROM "CalendarIntegration" WHERE id = $1 AND "userId" = $2 RETURNING *`;
    const result = await this.query(sql, [id, userId]);
    return result[0] || null;
  }
}

/**
 * Get BusinessDb instance for a business
 */
export function getBusinessDb(businessId) {
  return new BusinessDb(businessId);
}
