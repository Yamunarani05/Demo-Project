import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const applySalesDBUpdates = async () => {
  try {
    console.log("Checking for Sales DB structural updates...");
    
    // Check if table exists, allowing for different Prisma naming conventions
    const result: any[] = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND lower(table_name) IN ('client_deliveries', 'clientdelivery');
    `);

    // Ensure all values exist in PackageServiceCategory Postgres enum
    const enumValues = [
      'WEDDING', 'DELIVERABLE', 'COMPLEMENTARY', 'SHOOT',
      'RECEPTION', 'ENGAGEMENT', 'RITUALS', 'EXTRA_COMPLEMENTARY', 'SINGLE_SESSION'
    ];
    for (const val of enumValues) {
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TYPE "PackageServiceCategory" ADD VALUE IF NOT EXISTS '${val}';
        `);
      } catch (e) {
        // Ignore if value already exists
      }
    }
    console.log("✅ PackageServiceCategory enum updated successfully.");

    if (result && result.length > 0) {
      const tableName = result[0].table_name;
      // Add client_requirements using exact table casing
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "${tableName}" 
        ADD COLUMN IF NOT EXISTS client_requirements JSONB,
        ADD COLUMN IF NOT EXISTS approved_links JSONB;
      `);
      console.log(`✅ Sales DB updates: Column added to "${tableName}" successfully.`);
    } else {
      console.warn(
        "⚠️ Sales DB updates: Table 'client_deliveries' does not exist yet. Skipping alter.\n" +
        "   -> WHY IS THIS HAPPENING? The 'ClientDelivery' model was recently added to prisma/schema.prisma.\n" +
        "   -> HOW TO FIX: You need to run 'npx prisma db push' or apply the latest Prisma migrations against your LIVE Sales DB to physically create the table.\n" +
        "   -> This script will safely do nothing until the table is created by Prisma."
      );
    }
  } catch (err: any) {
    const dbCode = err.meta?.code || err.code;
    if (dbCode === '42701') {
      // column already exists, this is fine
      console.log("✅ Sales DB updates: columns already exist.");
    } else {
      console.error("❌ Error applying Sales DB updates:", err);
    }
  }
};
