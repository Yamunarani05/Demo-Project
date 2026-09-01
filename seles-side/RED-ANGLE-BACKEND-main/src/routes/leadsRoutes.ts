import { Router } from "express";
import LeadsController from "../controller/leadsController";
import {
  authenticateAdmin,
  authenticateAny,
  authenticateEmployee,
  authenticatePartner,
} from "../middleware/auth";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import {
  createLeadSchema,
  assignEmployeeSchema,
  paginationQuerySchema,
  leadIdParamSchema,
  employeeIdParamSchema,
  updateAssignEmployeeSchema,
  leadStagesBodySchema,
} from "../types/leadValidator";

const leadRoutes = Router();

// =========================================================
// 1. STATIC PATHS (MUST BE DEFINED BEFORE PARAMETERIZED /:leadId)
// =========================================================

leadRoutes.get("/cwd", (req, res) => res.send(process.cwd()));

// Bulk create leads (Admin, Employee, or Partner authenticated)
leadRoutes.post(
  "/bulk",
  authenticateAny,
  (req, res) => LeadsController.bulkCreate(req as any, res)
);

// Get leads by stage (with pagination)
leadRoutes.post(
  "/by-stages",
  validateBody(leadStagesBodySchema),
  (req, res) => LeadsController.getLeadsByStages(req as any, res)
);

// Assign employee to lead (admin only)
leadRoutes.post(
  "/assign-employee",
  authenticateAdmin,
  validateBody(assignEmployeeSchema),
  (req, res) => LeadsController.assignEmployeeToLead(req as any, res)
);

// Update employee assignment (admin only)
leadRoutes.put(
  "/update-assign-employee",
  authenticateAdmin,
  validateBody(updateAssignEmployeeSchema),
  (req, res) => LeadsController.updateEmployeeAssignment(req, res)
);

// Partner earnings
leadRoutes.get(
  "/earnings",
  authenticatePartner,
  (req, res) => LeadsController.getPartnerEarnings(req as any, res)
);

// Admin stats
leadRoutes.get(
  "/admin/stats",
  authenticateAdmin,
  (req, res) => LeadsController.adminStats(req, res)
);

// Employee stats
leadRoutes.get(
  "/employee/stats",
  authenticateEmployee,
  (req, res) => LeadsController.employeeStats(req as any, res)
);

// Employee tasks
leadRoutes.get(
  "/tasks/my",
  authenticateEmployee,
  (req, res) => LeadsController.getMyTasks(req as any, res)
);

// Update task status / stage
leadRoutes.patch(
  "/tasks/:taskId/status",
  authenticateAny,
  (req, res) => LeadsController.updateTaskStatus(req as any, res)
);

// Partner tasks
leadRoutes.get(
  "/tasks/partner/my",
  authenticatePartner,
  (req, res) => LeadsController.getMyPartnerTasks(req as any, res)
);

// Partner assigned leads
leadRoutes.get(
  "/partner/assigned-leads",
  authenticatePartner,
  LeadsController.getMyAssignedLeads
);

// Month-wise channel lead counts
leadRoutes.get(
  "/channel/me/month-wise",
  authenticateAny,
  LeadsController.countChannelLeadsMonthWise
);

leadRoutes.get(
  "/channel/month-wise",
  authenticateAny,
  LeadsController.countChannelLeadsMonthWise
);

leadRoutes.get(
  "/channel/:employeeId/month-wise",
  validateParams(employeeIdParamSchema),
  (req, res) => LeadsController.countChannelLeadsMonthWise(req as any, res)
);

leadRoutes.get(
  "/channel/:employeeId",
  authenticateAny,
  (req, res) => LeadsController.countChannelLeadsMonthWise(req as any, res)
);

// Count channel leads by employee ID
leadRoutes.get(
  "/count-channel/:employeeId",
  validateParams(employeeIdParamSchema),
  (req, res) => LeadsController.countChannelLeads(req, res)
);

// Leads by employee ID
leadRoutes.get(
  "/employee/:employeeId",
  validateParams(employeeIdParamSchema),
  (req, res) => LeadsController.getLeadsByEmployee(req, res)
);

// List all leads (paginated)
leadRoutes.get(
  "/",
  validateQuery(paginationQuerySchema),
  (req, res) => LeadsController.getAll(req as any, res)
);

// Create single lead
leadRoutes.post(
  "/",
  authenticateAny,
  validateBody(createLeadSchema),
  (req, res) => LeadsController.create(req as any, res)
);

leadRoutes.post(
  "/create",
  authenticateAny,
  (req, res) => LeadsController.create(req as any, res)
);

// =========================================================
// 2. PARAMETERIZED PATHS (/:leadId, etc.)
// =========================================================

leadRoutes.get(
  "/:leadId/whatsapp",
  authenticateAny,
  (req, res) => LeadsController.getLeadWhatsappLink(req, res)
);

leadRoutes.get(
  "/test/:leadId",
  (req, res) => LeadsController.getOne(req, res)
);

leadRoutes.get(
  "/:leadId",
  validateParams(leadIdParamSchema),
  (req, res) => LeadsController.getOne(req, res)
);

leadRoutes.put(
  "/:leadId",
  authenticateAny,
  validateParams(leadIdParamSchema),
  (req, res) => LeadsController.update(req as any, res)
);

leadRoutes.patch(
  "/:leadId",
  authenticateAny,
  validateParams(leadIdParamSchema),
  (req, res) => LeadsController.update(req as any, res)
);

leadRoutes.delete(
  "/:leadId/permanent",
  validateParams(leadIdParamSchema),
  (req, res) => LeadsController.permanentDeleteLead(req, res)
);

leadRoutes.delete(
  "/:leadId",
  validateParams(leadIdParamSchema),
  (req, res) => LeadsController.delete(req, res)
);

export default leadRoutes;