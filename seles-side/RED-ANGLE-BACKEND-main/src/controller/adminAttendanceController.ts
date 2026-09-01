import { Response, Request } from "express";
import ExcelJS from "exceljs";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import adminAttendanceService from "../services/adminAttendanceService";

class AdminAttendanceController {

 /* ---------------- CHECK IN ---------------- */
async checkIn(req: AuthenticatedRequest, res: Response) {
  try {
    const adminId = Number(req.admin?.id);
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const now = new Date(); // ✅ single source of truth

    const attendance = await adminAttendanceService.checkIn(
      adminId,
      now // ❗ pass ONLY timestamp
    );

    return res.json({ success: true, attendance });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
/* ---------------- CHECK OUT ---------------- */
async checkOut(req: AuthenticatedRequest, res: Response) {
  try {
    const adminId = Number(req.admin?.id);
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const now = new Date(); // ✅ single source of truth

    const attendance = await adminAttendanceService.checkOut(
      adminId,
      now // ❗ pass ONLY timestamp
    );

    return res.json({ success: true, attendance });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}


  /* ---------------- MY ATTENDANCE RANGE ---------------- */
  async getMyAttendance(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = Number(req.admin?.id);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { from, to } = req.query as { from?: string; to?: string };

      const data = await adminAttendanceService.getAttendanceRange(
  userId,
  from,
  to
);

      return res.json({ success: true, attendance: data });

    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  /* ---------------- ADMIN BY USER ---------------- */
  async getAttendanceForAdmin(req: Request, res: Response) {
    try {
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user id" });
      }

      const { from, to } = req.query as { from?: string; to?: string };

      const data = await adminAttendanceService.getAttendanceRange(
        userId,
        from ?? "",
        to ?? ""
      );

      return res.json({ success: true, attendance: data });

    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  /* ---------------- DOWNLOAD EXCEL ---------------- */
  async downloadMyAttendanceExcel(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = Number(req.admin?.id);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { from, to } = req.query as { from?: string; to?: string };

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (from && to) {
        startDate = new Date(from);
        endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
      }

      const records = await prisma.adminAttendance.findMany({
        where: {
          userId,
          checkIn: { not: null },
          checkOut: { not: null },
          ...(startDate && endDate
            ? { checkIn: { gte: startDate, lte: endDate } }
            : {}),
        },
        orderBy: { checkIn: "asc" },
      });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Attendance Report");

      sheet.mergeCells("A1:E1");
      sheet.getCell("A1").value = "RED ANGLE STUDIO";
      sheet.getCell("A1").font = { size: 16, bold: true };
      sheet.getCell("A1").alignment = { horizontal: "center" };

      sheet.mergeCells("A2:E2");
      sheet.getCell("A2").value = "ADMIN ATTENDANCE REPORT";
      sheet.getCell("A2").font = { size: 12, bold: true };
      sheet.getCell("A2").alignment = { horizontal: "center" };

      sheet.mergeCells("A4:E4");
      sheet.getCell("A4").value = `Generated On: ${new Date().toLocaleString(
        "en-IN",
        { timeZone: "Asia/Kolkata" }
      )}`;

      const header = sheet.addRow([
        "Date",
        "Check In (IST)",
        "Check Out (IST)",
        "Worked Duration",
        "Status",
      ]);

      header.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF2563EB" },
        };
        cell.alignment = { horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      records.forEach((r) => {
        const start = new Date(r.checkIn!);
        const end = new Date(r.checkOut!);
        const diff = end.getTime() - start.getTime();

        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        const duration = `${hrs
          .toString()
          .padStart(2, "0")}h ${mins
          .toString()
          .padStart(2, "0")}m ${secs
          .toString()
          .padStart(2, "0")}s`;

        const row = sheet.addRow([
          r.date.toISOString().split("T")[0],
          start.toLocaleTimeString("en-IN"),
          end.toLocaleTimeString("en-IN"),
          duration,
          r.status ?? "Completed",
        ]);

        row.eachCell((cell) => {
          cell.alignment = { horizontal: "center" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      sheet.columns = [
        { width: 15 },
        { width: 20 },
        { width: 20 },
        { width: 22 },
        { width: 15 },
      ];

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=admin-attendance-report.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  /* ---------------- DATE ---------------- */
  async getAttendanceForDate(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.admin
        ? Number(req.admin.id)
        : Number(req.params.id);

      const date = req.query?.date
        ? String(req.query.date)
        : new Date().toISOString();

      const data = await adminAttendanceService.getAttendanceForDate(userId, date);

      return res.json({ success: true, attendance: data });

    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  /* ---------------- MONTHLY STATS ---------------- */
  async getMonthlyStats(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);
      const year = Number(req.query.year);
      const month = Number(req.query.month);

      const stats = await adminAttendanceService.getMonthlyStats(
        userId,
        year,
        month
      );

      return res.json({ success: true, data: stats });

    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
}

export default new AdminAttendanceController();
