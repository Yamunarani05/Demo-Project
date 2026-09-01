-- AlterTable
ALTER TABLE "leads_detail" ADD COLUMN     "leadCode" VARCHAR(20),
ADD COLUMN     "leadType" TEXT NOT NULL DEFAULT 'LD';
