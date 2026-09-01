/*
  Warnings:

  - You are about to drop the column `leadCode` on the `leads_detail` table. All the data in the column will be lost.
  - You are about to drop the `assigned_projects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "assigned_projects" DROP CONSTRAINT "assigned_projects_employee_id_fkey";

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "price" DECIMAL(12,2) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "qtyOverrides" JSONB;

-- AlterTable
ALTER TABLE "leads_detail" DROP COLUMN "leadCode",
ADD COLUMN     "lead_serial_number" VARCHAR(20);

-- DropTable
DROP TABLE "assigned_projects";

-- DropEnum
DROP TYPE "ProjectStatus";

-- CreateTable
CREATE TABLE "invoice_markings" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "value" VARCHAR(500) NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_markings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_sequence" (
    "id" VARCHAR(10) NOT NULL,
    "seq_value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lead_sequence_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invoice_markings" ADD CONSTRAINT "invoice_markings_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("invoice_id") ON DELETE CASCADE ON UPDATE CASCADE;
