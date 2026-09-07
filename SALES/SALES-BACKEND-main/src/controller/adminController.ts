import { Request, Response } from "express";
import { AdminService } from "../services/adminService";

export class AdminController {
  
  static async createAdmin(req: Request, res: Response) {
    try {
      const { email, name, password, lastName } = req.body;

      if (!email || !name || !password) {
        return res.status(400).json({
          success: false,
          message: "Email, name, and password are required",
        });
      }

      const admin = await AdminService.createAdmin({
        email,
        name,
        lastName,
        password,
      });

      return res.status(201).json({
        success: true,
        message: "Admin created successfully",
        data: admin,
      });
    } catch (error: any) {
      console.error("Create admin error:", error);

      if (error.message.includes("already exists")) {
        return res.status(409).json({
          success: false,
          message: "Admin with this email already exists",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  


  static async getProfile(req: Request, res: Response) {
    try {
      
      const adminId = (req as any).adminId;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const admin = await AdminService.getAdminById(adminId);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Admin profile retrieved successfully",
        data: admin,
      });
    } catch (error: any) {
      console.error("Get admin profile error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}
