-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Pending', 'Completed', 'Rework');

-- AlterTable
ALTER TABLE "leads_detail" ADD COLUMN     "lead_followed_by" VARCHAR(150);

-- AlterTable
ALTER TABLE "quotation_packages" ADD COLUMN     "items" JSONB;

-- CreateTable
CREATE TABLE "assigned_projects" (
    "id" SERIAL NOT NULL,
    "project_id" VARCHAR(50) NOT NULL,
    "project_type" VARCHAR(100) NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'Pending',
    "upload_link" TEXT,
    "admin_notes" TEXT,
    "assigned_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assigned_projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assigned_projects_project_id_project_type_key" ON "assigned_projects"("project_id", "project_type");

-- AddForeignKey
ALTER TABLE "assigned_projects" ADD CONSTRAINT "assigned_projects_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees_detail"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;
