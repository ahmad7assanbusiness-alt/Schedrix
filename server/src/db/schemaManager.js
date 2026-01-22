import { PrismaClient } from "@prisma/client";
import prisma from "../prisma.js";

/**
 * Get the schema name for a business
 */
export function getBusinessSchemaName(businessId) {
  return `business_${businessId.replace(/-/g, "_")}`;
}

/**
 * Create a Prisma client for a specific business schema
 */
export function getBusinessPrismaClient(businessId) {
  const schemaName = getBusinessSchemaName(businessId);
  
  // Create a new Prisma client with the business-specific schema
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}?schema=${schemaName}`,
      },
    },
  });
}

/**
 * Create a PostgreSQL schema for a business
 */
export async function createBusinessSchema(businessId) {
  const schemaName = getBusinessSchemaName(businessId);
  
  // Create the schema
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}";`);
  
  console.log(`Created schema: ${schemaName}`);
}

/**
 * Create all tables in a business schema
 */
export async function createBusinessTables(businessId) {
  const schemaName = getBusinessSchemaName(businessId);
  
  // SQL to create all tables in the business schema
  const createTablesSQL = `
    -- Create enum types in the business schema
    CREATE TYPE "${schemaName}"."RequestStatus" AS ENUM ('OPEN', 'CLOSED');
    CREATE TYPE "${schemaName}"."ScheduleFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');
    CREATE TYPE "${schemaName}"."ScheduleStatus" AS ENUM ('DRAFT', 'PUBLISHED');
    
    -- AvailabilityRequest table
    CREATE TABLE IF NOT EXISTS "${schemaName}"."AvailabilityRequest" (
      id TEXT PRIMARY KEY,
      "startDate" TIMESTAMP NOT NULL,
      "endDate" TIMESTAMP NOT NULL,
      status "${schemaName}"."RequestStatus" NOT NULL DEFAULT 'OPEN',
      frequency "${schemaName}"."ScheduleFrequency",
      "createdByUserId" TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    -- AvailabilityEntry table
    CREATE TABLE IF NOT EXISTS "${schemaName}"."AvailabilityEntry" (
      id TEXT PRIMARY KEY,
      "requestId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      date TIMESTAMP NOT NULL,
      blocks JSONB NOT NULL,
      note TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE("requestId", "userId", date)
    );
    
    -- ScheduleWeek table
    CREATE TABLE IF NOT EXISTS "${schemaName}"."ScheduleWeek" (
      id TEXT PRIMARY KEY,
      "startDate" TIMESTAMP NOT NULL,
      "endDate" TIMESTAMP NOT NULL,
      status "${schemaName}"."ScheduleStatus" NOT NULL DEFAULT 'DRAFT',
      "createdByUserId" TEXT NOT NULL,
      "availabilityRequestId" TEXT,
      "templateId" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      rows JSONB,
      columns JSONB
    );
    
    -- ShiftAssignment table
    CREATE TABLE IF NOT EXISTS "${schemaName}"."ShiftAssignment" (
      id TEXT PRIMARY KEY,
      "scheduleId" TEXT NOT NULL,
      date TIMESTAMP NOT NULL,
      "startTime" TEXT NOT NULL DEFAULT '09:00',
      "endTime" TEXT NOT NULL DEFAULT '17:00',
      position TEXT NOT NULL,
      "shiftType" TEXT NOT NULL DEFAULT 'morning',
      "assignedUserId" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    -- ScheduleTemplate table
    CREATE TABLE IF NOT EXISTS "${schemaName}"."ScheduleTemplate" (
      id TEXT PRIMARY KEY,
      name TEXT,
      rows JSONB,
      columns JSONB,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    -- TemplateEmployeeAssignment table
    CREATE TABLE IF NOT EXISTS "${schemaName}"."TemplateEmployeeAssignment" (
      id TEXT PRIMARY KEY,
      "templateId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE("templateId", "userId")
    );
    
    -- CalendarIntegration table
    CREATE TABLE IF NOT EXISTS "${schemaName}"."CalendarIntegration" (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      provider TEXT NOT NULL,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "calendarId" TEXT,
      enabled BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE("userId", provider)
    );
    
    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_availability_request_user ON "${schemaName}"."AvailabilityRequest"("createdByUserId");
    CREATE INDEX IF NOT EXISTS idx_availability_entry_request ON "${schemaName}"."AvailabilityEntry"("requestId");
    CREATE INDEX IF NOT EXISTS idx_availability_entry_user ON "${schemaName}"."AvailabilityEntry"("userId");
    CREATE INDEX IF NOT EXISTS idx_schedule_week_created_by ON "${schemaName}"."ScheduleWeek"("createdByUserId");
    CREATE INDEX IF NOT EXISTS idx_shift_assignment_schedule ON "${schemaName}"."ShiftAssignment"("scheduleId");
    CREATE INDEX IF NOT EXISTS idx_shift_assignment_user ON "${schemaName}"."ShiftAssignment"("assignedUserId");
    CREATE INDEX IF NOT EXISTS idx_template_assignment_template ON "${schemaName}"."TemplateEmployeeAssignment"("templateId");
    CREATE INDEX IF NOT EXISTS idx_template_assignment_user ON "${schemaName}"."TemplateEmployeeAssignment"("userId");
  `;
  
  await prisma.$executeRawUnsafe(createTablesSQL);
  console.log(`Created tables in schema: ${schemaName}`);
}

/**
 * Initialize a business database (create schema and tables)
 */
export async function initializeBusinessDatabase(businessId) {
  try {
    await createBusinessSchema(businessId);
    await createBusinessTables(businessId);
    console.log(`Successfully initialized database for business: ${businessId}`);
  } catch (error) {
    console.error(`Error initializing business database for ${businessId}:`, error);
    throw error;
  }
}

/**
 * Drop a business schema (use with caution!)
 */
export async function dropBusinessSchema(businessId) {
  const schemaName = getBusinessSchemaName(businessId);
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE;`);
  console.log(`Dropped schema: ${schemaName}`);
}
