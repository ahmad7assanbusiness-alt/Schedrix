/**
 * Migration script to create database schemas for existing businesses
 * Run this once to initialize schemas for all existing businesses
 */
import prisma from "../prisma.js";
import { initializeBusinessDatabase } from "./schemaManager.js";

async function migrateExistingBusinesses() {
  try {
    console.log("Starting migration for existing businesses...");
    
    // Get all businesses
    const businesses = await prisma.business.findMany({
      select: { id: true, name: true },
    });
    
    console.log(`Found ${businesses.length} businesses to migrate`);
    
    for (const business of businesses) {
      try {
        console.log(`Migrating business: ${business.name} (${business.id})...`);
        await initializeBusinessDatabase(business.id);
        console.log(`✓ Successfully migrated business: ${business.name}`);
      } catch (error) {
        console.error(`✗ Failed to migrate business ${business.name}:`, error.message);
      }
    }
    
    console.log("Migration complete!");
    await prisma.$disconnect();
  } catch (error) {
    console.error("Migration error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateExistingBusinesses();
}

export default migrateExistingBusinesses;
