// import { Router } from "express";
// import LeadsController from "../controller/leadsController";
// import {
//   authenticateAdmin,
//   authenticateAny,
//   authenticateEmployee,
//   authenticatePartner,
// } from "../middleware/auth";
// import {
//   validateBody,
//   validateParams,
//   validateQuery,
// } from "../middleware/validation";
// import { createLeadSchema, assignEmployeeSchema, paginationQuerySchema, leadIdParamSchema, employeeIdParamSchema, leadEarningsQuerySchema, updateAssignEmployeeSchema, emptySchema } from "../types/leadValidator";
// import { updateLeadSchema } from "../types/quotationValidator";

// const leadRoutes = Router();

// leadRoutes.post(
//   "/",
//   authenticateAny,
//   validateBody(createLeadSchema),
//   LeadsController.create
// );

// leadRoutes.post(
//   "/assign-employee",
//   authenticateAdmin,
//   validateBody(assignEmployeeSchema),
//   LeadsController.assignEmployeeToLead
// );
// leadRoutes.put(
//   "/update-assign-employee",
//   authenticateAdmin,
//   validateBody(updateAssignEmployeeSchema),
//   LeadsController.updateEmployeeAssignment
// );
// leadRoutes.get(
//   "/earnings",
//   authenticatePartner,
//   LeadsController.getPartnerEarnings
// );

// leadRoutes.get(
//   "/employee/:employeeId",
//   validateParams(employeeIdParamSchema),
//   LeadsController.getLeadsByEmployee
// );

// leadRoutes.get(
//   "/",
//   validateQuery(paginationQuerySchema),
//   LeadsController.getAll
// );

// leadRoutes.get(
//   "/:leadId",
//   validateParams(leadIdParamSchema),
//   LeadsController.getOne
// );

// leadRoutes.put(
//   "/:leadId",
//   authenticateAny,
//   validateParams(leadIdParamSchema),
//   validateBody(updateLeadSchema),
//   LeadsController.update
// );

// leadRoutes.delete(
//   "/:leadId",
//   validateParams(leadIdParamSchema),
//   LeadsController.delete
// );

// leadRoutes.get(
//   "/count-channel/:employeeId",
//   validateParams(employeeIdParamSchema),
//   LeadsController.countChannelLeads
// );

// leadRoutes.get(
//   "/admin/stats",
//   authenticateAdmin,
//   LeadsController.adminStats
// );

// leadRoutes.get(
//   "/employee/stats",
//   authenticateEmployee,
//   LeadsController.employeeStats
// );

// leadRoutes.get(
//   "/tasks/my",
//   authenticateEmployee,
//   LeadsController.getMyTasks
// );

// leadRoutes.get(
//   "/channel/:employeeId/month-wise",
//   validateParams(employeeIdParamSchema),
//   LeadsController.countChannelLeadsMonthWise
// );

// leadRoutes.post(
//   "/bulk",
//   authenticateAdmin,
//   LeadsController.bulkCreate
// );

// export default leadRoutes;


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
  leadEarningsQuerySchema,
  updateAssignEmployeeSchema,
  emptySchema,
  leadStageParamSchema,
  leadStagesBodySchema,
} from "../types/leadValidator";
import { updateLeadSchema } from "../types/quotationValidator";

const leadRoutes = Router();

leadRoutes.get("/cwd", (req, res) => res.send(process.cwd()));

// Create lead (admin / partner / employee depending on authenticateAny)
leadRoutes.post(
  "/",
  authenticateAny,
  validateBody(createLeadSchema),
  (req, res) => LeadsController.create(req as any, res)
);
leadRoutes.get(
  "/:leadId/whatsapp",
  authenticateAny, // admin / employee / partner
  LeadsController.getLeadWhatsappLink
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

// Leads by employee id (no auth in this snippet)
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

// Get single lead
leadRoutes.get(
  "/:leadId",
  validateParams(leadIdParamSchema),
  (req, res) => LeadsController.getOne(req, res)
);

leadRoutes.get(
  "/test/:leadId",
  (req, res) => LeadsController.getOne(req, res)
);

leadRoutes.get(
  "/channel/me/month-wise",
    authenticateAny,
  // validateParams(employeeIdParamSchema),
  LeadsController.countChannelLeadsMonthWise
);

// Update lead
leadRoutes.put(
  "/:leadId",
  authenticateAny,
  validateParams(leadIdParamSchema),
 // validateBody(updateLeadSchema),
  (req, res) => LeadsController.update(req as any, res)
);

// Soft delete lead
leadRoutes.delete(
  "/:leadId",
  validateParams(leadIdParamSchema),
  (req, res) => LeadsController.delete(req, res)
);

// Permanent delete lead
leadRoutes.delete(
  "/:leadId/permanent",
  validateParams(leadIdParamSchema),
  (req, res) => LeadsController.permanentDeleteLead(req, res)
);

// Count leads by channel for employee
leadRoutes.get(
  "/count-channel/:employeeId",
  validateParams(employeeIdParamSchema),
  (req, res) => LeadsController.countChannelLeads(req, res)
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

leadRoutes.get(
  "/partner/assigned-leads",
  authenticatePartner,
  LeadsController.getMyAssignedLeads
);


// leadRoutes.get(
//   "/partner/assigned-leads",
//   authenticatePartner,
//   (req, res) =>
//     LeadsController.getPartnerAssignedLeads(req as any, res)
// );

// Month-wise channel leads
leadRoutes.get(
  "/channel/:employeeId",
 authenticateAny,
  (req, res) => LeadsController.countChannelLeadsMonthWise(req, res)
);

// Bulk create leads (admin only)
leadRoutes.post(
  "/bulk",
  authenticateAdmin,
  (req, res) => LeadsController.bulkCreate(req as any, res)
);

// Get leads by stage (with pagination)
leadRoutes.post(
  "/by-stages",
  validateBody(leadStagesBodySchema),
  (req, res) => LeadsController.getLeadsByStages(req as any, res)
);
 leadRoutes.get(
  "/tasks/partner/my",
  authenticatePartner,
  (req, res) =>
    LeadsController.getMyPartnerTasks(req as any, res)
);



export default leadRoutes;