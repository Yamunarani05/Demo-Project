import { Router } from "express";
import { DashboardController } from "../controller/dashboardController";
import { validateQuery } from "../middleware/validation";
import {
  employeeProjectQuerySchema,
  performanceQuerySchema,
} from "../types/dashboardValidator";
import { authenticateAdmin } from "../middleware/auth";

const dashboardRoutes = Router();

dashboardRoutes.get("/counts",authenticateAdmin, DashboardController.totalCount);

dashboardRoutes.get(
  "/employee-project",
  authenticateAdmin,
  validateQuery(employeeProjectQuerySchema),
  DashboardController.employeeProject
);

dashboardRoutes.get(
  "/performance",
  authenticateAdmin,
  validateQuery(performanceQuerySchema),
  DashboardController.performance
);

export default dashboardRoutes;
