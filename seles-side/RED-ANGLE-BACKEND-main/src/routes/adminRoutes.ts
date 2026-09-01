import { Router } from "express";
import { AdminController } from "../controller/adminController";
import employeeController from "../controller/employeeController";
import employeesService from "../services/employees.service";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { authenticateAdmin, authenticateAny } from "../middleware/auth";
import { validateBody } from "../middleware/validation";
import { createAdminSchema } from "../types/adminValidator";
import { updateEmployeeSchema } from "../types/employeeValidation";

const adminRoutes = Router();

/* ================= ADMIN ================= */

adminRoutes.post(
  "/create",
  validateBody(createAdminSchema),
  AdminController.createAdmin
);

adminRoutes.get(
  "/profile",
  authenticateAdmin,
  AdminController.getProfile
);

/* ================= EMPLOYEE (ADMIN ONLY) ================= */

adminRoutes.get(
  "/sales-tracker",
  async (req, res) => {
    try {
      const assignments = await prisma.leadEmployee.findMany({
        include: {
          employee: true,
          lead: true,
        },
      });

      const mapped = assignments.map((a) => ({
        id: a.leadEmployeeId,
        clientId: String(a.lead?.leadId || ""),
        serialNumber: a.lead?.leadId ? String(a.lead.leadId) : "",
        client: a.lead?.firstName ? `${a.lead.firstName} ${a.lead.lastName || ""}`.trim() : "Unknown",
        flowType: a.lead?.eventType || "",
        currentPhase: a.lead?.currentStage || "Sales",
        task: a.taskName || "Assigned",
        employee: a.employee?.firstName ? `${a.employee.firstName} ${a.employee.lastName || ""}`.trim() : "Unknown",
        role: a.employee?.position || "Employee",
        priority: "Normal",
        status: "Pending",
        startDate: a.createdAt,
        deadline: a.lead?.eventDate || null,
      }));

      res.json({ success: true, data: mapped });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

adminRoutes.put(
  "/employees/:id",               // ✅ MUST be :id
  authenticateAny,
  validateBody(updateEmployeeSchema),
  employeeController.update       // ✅ correct method
);

adminRoutes.delete(
  "/employees/:id",               // ✅ MUST be :id
authenticateAny,
  employeeController.delete       // ✅ correct method
);

/* ================= MAINTENANCE ================= */

// Fix broken employee-user links (admin only)
adminRoutes.post(
  "/maintenance/repair-employee-links",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await employeesService.repairEmployeeUserLinks();
      res.json({
        success: true,
        message: `Repaired ${result.repaired} employee-user links`,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default adminRoutes;
