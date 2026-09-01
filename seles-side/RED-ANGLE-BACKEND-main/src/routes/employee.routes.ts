// // src/routes/EmployeeRoutes.ts

// import { Router } from "express";
// import employeeController from "../controller/employeeController";
// import {
//   authenticateAdmin,
//   authenticateEmployee,
//   authenticateAny,
//   authenticatePartner,
// } from "../middleware/auth";
// import {
//   validateBody,
//   validateParams,
//   validateQuery,
// } from "../middleware/validation";
// import {
//   createEmployeeSchema,
//   updateEmployeeSchema,
//   idParamSchema,
//   createLeaveSchema,
//   leaveApprovalSchema,
//   paginationQuerySchema,
//   monthlyLeaveQuerySchema,
//   annualLeaveQuerySchema,
//   profileQuerySchema,
// } from "../types/employeeValidation";

// const EmployeeRoutes = Router();

// EmployeeRoutes.post(
//   "/",
//   authenticateAdmin,
//   validateBody(createEmployeeSchema),
//   employeeController.create
// );

// EmployeeRoutes.get("/", employeeController.getAll);

// EmployeeRoutes.post(
//   "/leave",
//   authenticateEmployee,
//   validateBody(createLeaveSchema),
//   employeeController.createLeave
// );

// EmployeeRoutes.get(
//   "/leave",
//   authenticateAny,
//   validateQuery(paginationQuerySchema),
//   employeeController.getEmployeeLeaves
// );

// EmployeeRoutes.get(
//   "/leave/monthly",
//   authenticateEmployee,
//   validateQuery(monthlyLeaveQuerySchema),
//   employeeController.getMonthlyApprovedLeaveCount
// );

// EmployeeRoutes.get(
//   "/leave/annual",
//   authenticateEmployee,
//   validateQuery(annualLeaveQuerySchema),
//   employeeController.getAnnualLeaveSummary
// );

// EmployeeRoutes.get(
//   "/leave/:id",
//   authenticateAdmin,
//   validateParams(idParamSchema),
//   employeeController.getEmployeeLeavesById
// );

// EmployeeRoutes.put(
//   "/leave/approval/:id",
//   authenticateAdmin,
//   validateParams(idParamSchema),
//   validateBody(leaveApprovalSchema),
//   employeeController.leaveApproval
// );

// EmployeeRoutes.get("/report/daily", employeeController.getDailyReport);

// // existing partner-only profile endpoint
// EmployeeRoutes.get(
//   "/profile",
//   authenticateAny,
//   validateQuery(profileQuerySchema),
//   employeeController.getProfile
// );

// // NEW: employee self-profile (by token userId)
// EmployeeRoutes.get(
//   "/self",
//   authenticateEmployee,
//   employeeController.getSelf
// );

// EmployeeRoutes.get(
//   "/:id",
//   validateParams(idParamSchema),
//   employeeController.getById
// );

// EmployeeRoutes.put(
//   "/:id",
//   authenticateAdmin,
//   validateParams(idParamSchema),
//   validateBody(updateEmployeeSchema),
//   employeeController.update
// );

// EmployeeRoutes.delete(
//   "/:id",
//   authenticateAdmin,
//   validateParams(idParamSchema),
//   employeeController.delete
// );

// export default EmployeeRoutes;


// src/routes/EmployeeRoutes.ts

import { Router } from "express";
import employeeController from "../controller/employeeController";
import { uploadEmployeeFiles } from "../middleware/uploadEmployeeFiles";
import {
  authenticateAdmin,
  authenticateEmployee,
  authenticateAny,
  authenticatePartner,
} from "../middleware/auth";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  idParamSchema,
  createLeaveSchema,
  leaveApprovalSchema,
  paginationQuerySchema,
  monthlyLeaveQuerySchema,
  annualLeaveQuerySchema,
  profileQuerySchema,
} from "../types/employeeValidation";

const EmployeeRoutes = Router();

// EmployeeRoutes.post(
//   "/",
//   authenticateAdmin,
//   validateBody(createEmployeeSchema),
//   employeeController.create
// );

EmployeeRoutes.get("/", employeeController.getAll);

EmployeeRoutes.post(
  "/leave",
  authenticateEmployee,
  validateBody(createLeaveSchema),
  employeeController.createLeave
);

EmployeeRoutes.get(
  "/leave",
  authenticateAny,
  validateQuery(paginationQuerySchema),
  employeeController.getEmployeeLeaves
);

EmployeeRoutes.get(
  "/leave/monthly",
  authenticateEmployee,
  validateQuery(monthlyLeaveQuerySchema),
  employeeController.getMonthlyApprovedLeaveCount
);

EmployeeRoutes.get(
  "/leave/annual",
  authenticateEmployee,
  validateQuery(annualLeaveQuerySchema),
  employeeController.getAnnualLeaveSummary
);

EmployeeRoutes.get(
  "/leave/:id",
  authenticateAdmin,
  validateParams(idParamSchema),
  employeeController.getEmployeeLeavesById
);

EmployeeRoutes.put(
  "/leave/approval/:id",
  authenticateAdmin,
  validateParams(idParamSchema),
  validateBody(leaveApprovalSchema),
  employeeController.leaveApproval
);

EmployeeRoutes.get("/report/daily", employeeController.getDailyReport);

// Multi-Sheet Export
EmployeeRoutes.get("/report/export", authenticateAny, employeeController.exportMultiSheetExcel);

// existing partner-only profile endpoint
EmployeeRoutes.get(
  "/profile",
  authenticateAny,
  validateQuery(profileQuerySchema),
  employeeController.getProfile
);

// NEW: employee self-profile (by token userId)
EmployeeRoutes.get(
  "/self",
  authenticateEmployee,
  employeeController.getSelf
);

EmployeeRoutes.get(
  "/:id",
  validateParams(idParamSchema),
  employeeController.getById
);

EmployeeRoutes.put(
  "/:id",
  authenticateAny,
  validateParams(idParamSchema),
  uploadEmployeeFiles.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "documentPdf", maxCount: 1 },
  ]),
  employeeController.update
);

EmployeeRoutes.post(
  "/",
  authenticateAdmin,
  uploadEmployeeFiles.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "documentPdf", maxCount: 1 },
  ]),
  employeeController.create
);


EmployeeRoutes.delete(
  "/:id",
  authenticateAdmin,
  validateParams(idParamSchema),
  employeeController.delete
);

export default EmployeeRoutes;