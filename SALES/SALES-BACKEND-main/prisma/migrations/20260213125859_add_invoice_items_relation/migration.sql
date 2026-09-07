-- CreateTable
CREATE TABLE "InvoiceAddon" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "addonServiceId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "InvoiceAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InvoiceAddon" ADD CONSTRAINT "InvoiceAddon_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceAddon" ADD CONSTRAINT "InvoiceAddon_addonServiceId_fkey" FOREIGN KEY ("addonServiceId") REFERENCES "addon_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("invoice_id") ON DELETE CASCADE ON UPDATE CASCADE;
