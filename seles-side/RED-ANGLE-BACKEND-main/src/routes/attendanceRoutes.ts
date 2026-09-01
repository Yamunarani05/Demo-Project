import { Router } from "express";
import attendanceController from "../controller/attendanceController";
import { authenticateEmployee, authenticateAdmin } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../middleware/validation";
import {
  attendanceActionSchema,
  attendanceRangeQuerySchema,
  attendanceDateQuerySchema,
  employeeIdParamSchema,
  employeeIdAltParamSchema,
  monthlyAttendanceQuerySchema,
  monthlySummaryQuerySchema,
} from "../types/attendanceValidation";
const attendancerouter = Router();
attendancerouter.post("/checkin", authenticateEmployee, validateBody(attendanceActionSchema), attendanceController.checkIn);
attendancerouter.post("/checkout", authenticateEmployee, validateBody(attendanceActionSchema), attendanceController.checkOut);
attendancerouter.get("/me", authenticateEmployee, validateQuery(attendanceRangeQuerySchema), attendanceController.getMyAttendance);
attendancerouter.get("/me/download",authenticateEmployee,attendanceController.downloadMyAttendanceExcel);
attendancerouter.get(
  "/monthly-summary/",
  authenticateEmployee, 
  validateQuery(monthlySummaryQuerySchema), // only validate query params
  attendanceController.getMonthlySummary
);
attendancerouter.get("/monthly/:employeeId",authenticateAdmin, validateParams(employeeIdAltParamSchema), attendanceController.getMonthlyStats);
attendancerouter.get("/:id", authenticateAdmin, validateParams(employeeIdParamSchema), attendanceController.getAttendanceForEmployee);
attendancerouter.get("/:id/date", authenticateAdmin, validateParams(employeeIdParamSchema), attendanceController.getAttendanceForDate);


export default attendancerouter;
