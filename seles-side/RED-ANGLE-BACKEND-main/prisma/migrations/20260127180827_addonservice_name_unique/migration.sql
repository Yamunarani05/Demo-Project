/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `addon_services` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "addon_services_name_key" ON "addon_services"("name");
