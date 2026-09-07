-- CreateTable
CREATE TABLE "invoice_additional" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "events" JSONB NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_additional_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invoice_additional" ADD CONSTRAINT "invoice_additional_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("invoice_id") ON DELETE CASCADE ON UPDATE CASCADE;
