/*
  Warnings:

  - You are about to drop the column `event_id` on the `payments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_event_id_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "event_id",
ALTER COLUMN "payment_date" SET DEFAULT CURRENT_TIMESTAMP;
