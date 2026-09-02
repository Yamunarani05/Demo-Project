import express from "express";
import { getAdminDashboardStats } from "../controllers/dashboard.controller";

import { 
    getPhaseReportController, 
    getClientsReportController,
    getEmployeesReportController,
    getEmployeeAttendanceReportController,
    getEmployeeLeaveReportController,
    getEmployeeWorkReportController,
    getSingleClientReportController,
    getSingleEmployeeReportController
} from "../controllers/adminReports.controller";

const router = express.Router();

// GET /api/admin/dashboard-stats
router.get("/dashboard-stats", getAdminDashboardStats);

// GET /api/admin/reports/...
router.get("/reports/phase/:phase", getPhaseReportController);
router.get("/reports/clients", getClientsReportController);
router.get("/reports/employees", getEmployeesReportController);
router.get("/reports/attendance", getEmployeeAttendanceReportController);
router.get("/reports/leave", getEmployeeLeaveReportController);
router.get("/reports/work", getEmployeeWorkReportController);
router.get("/reports/single-client/:clientId", getSingleClientReportController);
router.get("/reports/single-employee/:employeeId", getSingleEmployeeReportController);

export default router;
