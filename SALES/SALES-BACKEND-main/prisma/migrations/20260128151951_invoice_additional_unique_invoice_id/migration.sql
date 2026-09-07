/*
  Warnings:

  - A unique constraint covering the columns `[invoice_id]` on the table `invoice_additional` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "invoice_additional_invoice_id_key" ON "invoice_additional"("invoice_id");
