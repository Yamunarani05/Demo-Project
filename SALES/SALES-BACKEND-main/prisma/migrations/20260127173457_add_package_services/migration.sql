-- CreateEnum
CREATE TYPE "PackageServiceCategory" AS ENUM ('WEDDING', 'DELIVERABLE', 'COMPLEMENTARY', 'SHOOT');

-- CreateTable
CREATE TABLE "package_service_items" (
    "id" SERIAL NOT NULL,
    "package_service_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "category" "PackageServiceCategory" NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_service_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon_services" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "unit_label" TEXT NOT NULL DEFAULT 'Session',
    "defaultQty" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addon_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_addons" (
    "id" SERIAL NOT NULL,
    "lead_id" INTEGER NOT NULL,
    "addon_service_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_addons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lead_addons_lead_id_addon_service_id_key" ON "lead_addons"("lead_id", "addon_service_id");

-- AddForeignKey
ALTER TABLE "package_service_items" ADD CONSTRAINT "package_service_items_package_service_id_fkey" FOREIGN KEY ("package_service_id") REFERENCES "packageServices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_addons" ADD CONSTRAINT "lead_addons_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads_detail"("lead_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_addons" ADD CONSTRAINT "lead_addons_addon_service_id_fkey" FOREIGN KEY ("addon_service_id") REFERENCES "addon_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
