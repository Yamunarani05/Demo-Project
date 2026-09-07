import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard";

export class DashboardController {
  static async totalCount(req: Request, res: Response) {
    try {
      const data = await DashboardService.totalCount();
      return res.status(200).json({
        success: true,
        message: "Dashboard counts retrieved successfully",
        data,
      });
    } catch (error: any) {
      console.error("Dashboard totalCount error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error?.message ?? "Unexpected error",
      });
    }
  }

  static async employeeProject(req: Request, res: Response) {
    try {
    const page=parseInt(req.query.page as string);
    const limit=parseInt(req.query.limit as string);
    const skip=(page-1)*limit
      const data = await DashboardService.EmployeeProject(limit,skip);
      return res.status(200).json({
        success: true,
        message: "Employee projects retrieved successfully",
        data,
      });
    } catch (error: any) {
      console.error("Dashboard employeeProject error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error?.message ?? "Unexpected error",
      });
    }
  }

  static async performance(req: Request, res: Response) {
    try {
    const type=req.query.type as string;
      const data = await DashboardService.Performance(type || 'week');
      return res.status(200).json({
        success: true,
        message: "Performance data retrieved successfully",
        data,
      });
    } catch (error: any) {
      console.error("Dashboard performance error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error?.message ?? "Unexpected error",
      });
    }
  }
}
