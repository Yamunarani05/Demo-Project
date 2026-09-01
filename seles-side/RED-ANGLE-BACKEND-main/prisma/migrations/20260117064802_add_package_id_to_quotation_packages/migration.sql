-- AlterTable
ALTER TABLE "quotation_packages" ADD COLUMN     "package_id" INTEGER;

-- AddForeignKey
ALTER TABLE "quotation_packages" ADD CONSTRAINT "quotation_packages_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packageServices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
