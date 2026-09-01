// 
// src/controller/employeeController.ts
import { Request, Response } from "express";
import employeesService from "../services/employees.service";
import { AuthenticatedRequest } from "../middleware/auth";
import { createEmployeeSchema } from "../types/employeeValidation";
import prisma from "../config/prisma";
import ExcelJS from "exceljs";

class EmployeeController {
 async create(req: AuthenticatedRequest, res: Response) {
  try {
    const createdBy = Number(req.admin?.id);

    // ✅ VALIDATE HERE
    const parsed = createEmployeeSchema.parse(req.body);

    const files = req.files as {
      profileImage?: Express.Multer.File[];
      documentPdf?: Express.Multer.File[];
    };

    const payload = {
      ...parsed,
      profileImagePath: req.body.profileImage || (files?.profileImage?.[0]
        ? `uploads/employees/profiles/${files.profileImage[0].filename}`
        : null),

      documentPdfPath: req.body.documentPdf || (files?.documentPdf?.[0]
        ? `uploads/employees/documents/${files.documentPdf[0].filename}`
        : null),
    };

    const employee = await employeesService.createEmployee(
      payload,
      createdBy
    );

    return res.status(201).json({ success: true, employee });
  } catch (err: any) {
    console.error("CREATE EMPLOYEE ERROR:", err);

    if (err.code === "P2002" && err.meta?.target?.includes("email")) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: { email: "Email already exists. Please use a different email." },
      });
    }

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err?.errors || err.message,
    });
  }
}
  async createLeave(req:AuthenticatedRequest, res: Response) {
    try {
      const createdBy = Number(req.employee?.id);
      const EmployeeLeaves = await employeesService.EmployeeLeaves(
        req.body,
        createdBy
      );
      return res
        .status(201)
        .json({ success: true, EmployeeLeaves });
    } catch (err: any) {
      return res
        .status(500)
        .json({ success: false, message: err.message });
    }
  }

  async leaveApproval(req: AuthenticatedRequest, res: Response) {
    try {
      const EmployeeLeavesApproval =
        await employeesService.EmployeeLeavesApprove(
          Number(req.params.id),
          req.body.status
        );
      return res
        .status(201)
        .json({ success: true, EmployeeLeavesApproval });
    } catch (err: any) {
      return res
        .status(500)
        .json({ success: false, message: err.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page || 0);
      const limit = Number(req.query.limit || 10);
      const skip = page * limit;
      const search = (req.query.search as string) || "";
      const employees = await employeesService.getAllEmployees(
        limit,
        skip,
        search
      );
      res.json({ success: true, employees });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, message: err.message });
    }
  }

  async getEmployeeLeavesById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id is not present",
        });
      }
      const employees =
        await employeesService.getEmployeeLeavesById(id);
      res.json({ success: true, employees });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, message: err.message });
    }
  }

async getEmployeeLeaves(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const page = Number(req.query.page || 0);
    const limit = Number(req.query.limit || 10);
    const skip = page * limit;
    const search = (req.query.search as string) || "";

    let role: "admin" | "employee" | "partner" = "employee";
    let employeeId: number | null = null;

    if ("admin" in req && req.admin) {
      role = "admin";
    } 
    else if ("employee" in req && req.employee) {
      role = "employee";

      // ✅ THIS IS THE FIX
      employeeId = await employeesService.getEmployeeIdByUserId(
        Number(req.employee.id)
      );
    }

    const leaves = await employeesService.getEmployeeLeaves(
      role,
      employeeId,
      limit,
      skip,
      search
    );

    return res.json({ success: true, leaves });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

  async getById(req: Request, res: Response) {
    try {
      const employeeId = Number(req.params.id);
      const employee = await employeesService.getEmployeeById(
        employeeId
      );
      res.json({ success: true, employee });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, message: err.message });
    }
  }

  async getProfile(req:AuthenticatedRequest, res: Response) {
    try {
      // Only allow partner tokens
      if (!("partner" in req && (req as any).partner)) {
        return res.status(403).json({
          success: false,
          message: "Only partners can access this profile",
        });
      }

      const partnerId = Number((req as any).partner.id);

      if (!partnerId) {
        return res.status(400).json({
          success: false,
          message: "Partner ID missing in token",
        });
      }

      // Fetch profile by userId (partnerId)
      const profile =
        await employeesService.getEmployeeProfileByUserId(
          partnerId
        );

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      return res.status(200).json({
        success: true,
        profile,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // NEW: employee self-profile for EmployeeDetails page
  async getSelf(req:AuthenticatedRequest, res: Response) {
    try {
      const userId = Number(req.employee?.id);

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID missing in token",
        });
      }

      const profile =
        await employeesService.getEmployeeProfileByUserId(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      return res.status(200).json({
        success: true,
        profile,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const employeeId = Number(req.params.id);

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required",
        });
      }

      const files = req.files as {
        profileImage?: Express.Multer.File[];
        documentPdf?: Express.Multer.File[];
      };

      const payload: any = {
        ...req.body,
      };

      // ✅ PROFILE IMAGE
      if (req.body.profileImage) {
        payload.profileImagePath = req.body.profileImage;
      } else if (files?.profileImage?.[0]) {
        payload.profileImagePath =
          `uploads/employees/profiles/${files.profileImage[0].filename}`;
      }

      // ✅ DOCUMENT PDF
      if (req.body.documentPdf) {
        payload.documentPdfPath = req.body.documentPdf;
      } else if (files?.documentPdf?.[0]) {
        payload.documentPdfPath =
          `uploads/employees/documents/${files.documentPdf[0].filename}`;
      }
      console.log("BODY:", req.body);
console.log("FILES:", req.files);


      const updatedEmployee =
        await employeesService.updateEmployee(employeeId, payload);

      return res.json({
        success: true,
        data: updatedEmployee,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const employeeId = Number(req.params.id);
      const deleted = await employeesService.deleteEmployee(
        employeeId
      );
      res.json({ success: true, deleted });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, message: err.message });
    }
  }

  async getDailyReport(req: Request, res: Response) {
    try {
      const date = req.query.date
        ? new Date(String(req.query.date))
        : new Date();
      const report = await employeesService.getDailyReport(date);
      res.json({ success: true, report });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, message: err.message });
    }
  }

  async getMonthlyApprovedLeaveCount(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const userId = Number(req.employee?.id); // USER ID from JWT
      const year = Number(req.query.year);
      const month = Number(req.query.month);

      if (!userId || !year || !month) {
        return res.status(400).json({
          success: false,
          message: "year and month are required",
        });
      }

      const result =  
        await employeesService.getMonthlyApprovedLeaveCount(
          userId,
          year,
          month
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  async getAnnualLeaveSummary(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const employeeId = Number(req.employee?.id);
      const year = Number(req.query.year);

      if (!employeeId || !year) {
        return res.status(400).json({
          success: false,
          message:
            "Employee ID (from token) and year are required",
        });
      }

      const data =
        await employeesService.getAnnualLeaveSummary(
          employeeId,
          year
        );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
  async exportMultiSheetExcel(req: AuthenticatedRequest, res: Response) {
    try {
      const { from, to } = req.query as { from?: string; to?: string };

      if (!from || !to) {
        return res.status(400).json({ success: false, message: "from and to dates are required" });
      }

      const startDate = new Date(from);
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      // Fetch all active employees
      const employees = await prisma.employeesDetail.findMany({
        where: { isDeleted: false },
        orderBy: { firstName: 'asc' }
      });

      if (!employees.length) {
        return res.status(404).json({ success: false, message: "No active employees found" });
      }

      // Fetch all attendance records in range for these employees
      const records = await prisma.employeesAttendance.findMany({
        where: {
          employeeId: { in: employees.map((e: (typeof employees)[number]) => e.employeeId) },
          checkIn: { not: null },
          checkOut: { not: null },
          date: { gte: startDate, lte: endDate }
        },
        orderBy: { checkIn: "asc" }
      });

      // Group records by employeeId
      const recordsByEmployee = records.reduce((acc: Record<number, typeof records>, record: (typeof records)[number]) => {
        if (!acc[record.employeeId!]) acc[record.employeeId!] = [];
        acc[record.employeeId!].push(record);
        return acc;
      }, {} as Record<number, typeof records>);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "RED ANGLE STUDIO";

      const usedNames = new Set<string>();

      for (const employee of employees) {
        // Excel worksheet names must be <= 31 chars and no illegal characters
        let safeName = `${employee.firstName || ""} ${employee.lastName || ""}`
          .replace(/[\\/*?:\[\]]/g, '')
          .trim();
          
        if (!safeName) safeName = `Emp_${employee.employeeId}`;

        // Ensure we have room for the suffix and don't exceed 31 chars
        let baseName = safeName.substring(0, 27).trim();
        let finalName = baseName;
        
        // Ensure uniqueness
        let counter = 1;
        while (usedNames.has(finalName.toLowerCase())) {
          finalName = `${baseName}_${counter}`;
          counter++;
        }
        
        usedNames.add(finalName.toLowerCase());
          
        const sheet = workbook.addWorksheet(finalName);

        // ---- TITLE ----
        sheet.mergeCells("A1:E1");
        sheet.getCell("A1").value = "RED ANGLE STUDIO";
        sheet.getCell("A1").font = { size: 16, bold: true };
        sheet.getCell("A1").alignment = { horizontal: "center" };

        sheet.mergeCells("A2:E2");
        sheet.getCell("A2").value = `ATTENDANCE REPORT: ${employee.firstName?.toUpperCase()} ${employee.lastName?.toUpperCase()}`;
        sheet.getCell("A2").font = { size: 12, bold: true };
        sheet.getCell("A2").alignment = { horizontal: "center" };

        sheet.mergeCells("A4:E4");
        sheet.getCell("A4").value = `Period: ${startDate.toLocaleDateString("en-GB")} to ${endDate.toLocaleDateString("en-GB")}`;

        // ---- HEADER ----
        const headerRow = sheet.addRow([
          "Date",
          "Check In (IST)",
          "Check Out (IST)",
          "Worked Duration",
          "Status",
        ]);

        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF2563EB" }, // Blue
          };
          cell.alignment = { horizontal: "center" };
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });

        // ---- DATA ----
        const empRecords = recordsByEmployee[employee.employeeId] || [];

        if (empRecords.length === 0) {
          const emptyRow = sheet.addRow(["No attendance records", "", "", "", ""]);
          sheet.mergeCells(`A${emptyRow.number}:E${emptyRow.number}`);
          sheet.getCell(`A${emptyRow.number}`).alignment = { horizontal: "center" };
        } else {
          empRecords.forEach((r: (typeof records)[number]) => {
            const start = new Date(r.checkIn!);
            const end = new Date(r.checkOut!);
            const diff = end.getTime() - start.getTime();

            const hrs = Math.floor(diff / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);

            const duration = `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;

            const row = sheet.addRow([
              r.date.toISOString().split("T")[0],
              start.toLocaleTimeString("en-IN"),
              end.toLocaleTimeString("en-IN"),
              duration,
              "Completed",
            ]);

            row.eachCell((cell) => {
              cell.alignment = { horizontal: "center" };
              cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
          });
        }

        // ---- COLUMN WIDTH ----
        sheet.columns = [
          { width: 15 },
          { width: 20 },
          { width: 20 },
          { width: 22 },
          { width: 15 },
        ];
      }

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="attendance-report-all.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

    } catch (err: any) {
      console.error("exportMultiSheetExcel Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

}

export default new EmployeeController();