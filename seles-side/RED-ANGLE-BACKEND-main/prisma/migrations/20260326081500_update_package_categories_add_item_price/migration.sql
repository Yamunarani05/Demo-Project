-- Step 1: Add new enum values
ALTER TYPE "PackageServiceCategory" ADD VALUE IF NOT EXISTS 'RECEPTION';
ALTER TYPE "PackageServiceCategory" ADD VALUE IF NOT EXISTS 'ENGAGEMENT';
ALTER TYPE "PackageServiceCategory" ADD VALUE IF NOT EXISTS 'RITUALS';
ALTER TYPE "PackageServiceCategory" ADD VALUE IF NOT EXISTS 'EXTRA_COMPLEMENTARY';

-- Step 2: Migrate any existing rows using old values to WEDDING (safe fallback)
UPDATE "package_service_items"
SET category = 'WEDDING'
WHERE category IN ('DELIVERABLE', 'COMPLEMENTARY', 'SHOOT');

-- Step 3: Add price column to package_service_items
ALTER TABLE "package_service_items"
ADD COLUMN IF NOT EXISTS "price" DECIMAL(12, 2) NOT NULL DEFAULT 0.0;

-- Note: PostgreSQL does not allow removing enum values directly.
-- Old values (DELIVERABLE, COMPLEMENTARY, SHOOT) are kept in the enum type
-- but are no longer used or presented in the UI.
-- To fully remove them, a future migration can recreate the enum type.
