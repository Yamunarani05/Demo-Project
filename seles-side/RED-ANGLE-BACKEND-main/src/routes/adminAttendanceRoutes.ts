import { Router } from "express";
import adminAttendanceController from "../controller/adminAttendanceController";
import { authenticateAdmin } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../middleware/validation";

import {
  attendanceActionSchema,
  attendanceRangeQuerySchema,
  attendanceDateQuerySchema,
  employeeIdParamSchema,
  monthlyAttendanceQuerySchema,
} from "../types/attendanceValidation";

const adminAttendanceRouter = Router();

/* ---------------- SELF (ADMIN) ---------------- */

adminAttendanceRouter.post(
  "/checkin",
  authenticateAdmin,
  validateBody(attendanceActionSchema),
  adminAttendanceController.checkIn
);

adminAttendanceRouter.post(
  "/checkout",
  authenticateAdmin,
  validateBody(attendanceActionSchema),
  adminAttendanceController.checkOut
);

adminAttendanceRouter.get(
  "/me",
  authenticateAdmin,
  validateQuery(attendanceRangeQuerySchema),
  adminAttendanceController.getMyAttendance
);

adminAttendanceRouter.get(
  "/me/download",
  authenticateAdmin,
  adminAttendanceController.downloadMyAttendanceExcel
);

adminAttendanceRouter.get(
  "/me/date",
  authenticateAdmin,
  validateQuery(attendanceDateQuerySchema),
  adminAttendanceController.getAttendanceForDate
);

adminAttendanceRouter.get(
  "/me/monthly",
  authenticateAdmin,
  validateQuery(monthlyAttendanceQuerySchema),
  adminAttendanceController.getMonthlyStats
);

/* ---------------- ADMIN → ADMIN ---------------- */

adminAttendanceRouter.get(
  "/:id",
  authenticateAdmin,
  validateParams(employeeIdParamSchema), // id = userId
  adminAttendanceController.getAttendanceForAdmin
);

adminAttendanceRouter.get(
  "/:id/date",
  authenticateAdmin,
  validateParams(employeeIdParamSchema),
  validateQuery(attendanceDateQuerySchema),
  adminAttendanceController.getAttendanceForDate
);

adminAttendanceRouter.get(
  "/:id/monthly",
  authenticateAdmin,
  validateParams(employeeIdParamSchema),
  validateQuery(monthlyAttendanceQuerySchema),
  adminAttendanceController.getMonthlyStats
);

export default adminAttendanceRouter;
