// // src/controller/attendance.controller.ts
// import { Response, Request } from "express";
// import attendanceService from "../services/attendanceService";
// import prisma from "../config/prisma";
// import { AuthenticatedEmployeeRequest, AuthenticatedAdminRequest } from "../middleware/auth";
// import employeesService from "../services/employees.service";

// class AttendanceController {

//   // Helper: convert userId -> employeeId
//   private async getEmployeeIdFromToken(req: AuthenticatedEmployeeRequest): Promise<number | null> {
//     const userId = Number(req.employee?.id);
//     if (!userId) return null;

//     const employee = await prisma.employeesDetail.findUnique({
//       where: { userId }
//     });

//     return employee?.employeeId ?? null;
//   }

//   async checkIn(req: AuthenticatedEmployeeRequest, res: Response) {
//   try {
//     const userId = Number(req.employee?.id);
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     // ✅ get employeeId from EmployeesDetail
//     const employee = await prisma.employeesDetail.findUnique({
//       where: { userId }
//     });

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee record not found"
//       });
//     }

//     const { timestamp } = req.body;

//     const result = await attendanceService.checkIn(
//       employee.employeeId,
//       timestamp
//     );

//     return res.json({ success: true, attendance: result });

//   } catch (err: any) {
//     return res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// }


// async checkOut(req: AuthenticatedEmployeeRequest, res: Response) {
//     try {
//       const userId = Number(req.employee?.id);
//       if (!userId) {
//         return res.status(401).json({ success: false, message: "Unauthorized" });
//       }

//       const employee = await prisma.employeesDetail.findUnique({
//         where: { userId },
//       });

//       if (!employee) {
//         return res.status(404).json({
//           success: false,
//           message: "Employee record not found",
//         });
//       }

//       const { timestamp } = req.body;

//       const attendance = await attendanceService.checkOut(
//         employee.employeeId,
//         timestamp
//       );

//       return res.json({ success: true, attendance });

//     } catch (error: any) {
//       console.error("Check-out error:", error);
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

// async getMyAttendance(req: AuthenticatedEmployeeRequest, res: Response) {
//     try {
//       const userId = Number(req.employee?.id);
//       if (!userId) {
//         return res.status(401).json({ success: false, message: "Unauthorized" });
//       }

//       const employee = await prisma.employeesDetail.findUnique({
//         where: { userId },
//       });

//       if (!employee) {
//         return res.status(404).json({
//           success: false,
//           message: "Employee record not found",
//         });
//       }

//       const { from, to } = req.query as { from?: string; to?: string };

//       const data = await attendanceService.getAttendanceRange(
//         employee.employeeId,
//         from ?? "",
//         to ?? ""
//       );

//       return res.json({ success: true, attendance: data });

//     } catch (error: any) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   async getAttendanceForEmployee(req: AuthenticatedAdminRequest, res: Response) {
//     try {
//       const employeeId = Number(req.params.id);
//       if (isNaN(employeeId)) {
//         return res.status(400).json({ success: false, message: "Invalid employee id" });
//       }

//       const { from, to } = req.query as { from?: string; to?: string };
//       const data = await attendanceService.getAttendanceRange(employeeId, from ?? "", to ?? "");

//       return res.json({ success: true, attendance: data });
//     } catch (err: any) {
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async getAttendanceForDate(req: any, res: Response) {
//     try {
//       let employeeId: number;

//       if (req.employee) {
//         const emp = await prisma.employeesDetail.findUnique({
//           where: { userId: Number(req.employee.id) }
//         });
//         if (!emp) {
//           return res.status(401).json({ success: false, message: "Employee not found" });
//         }
//         employeeId = emp.employeeId;
//       } else {
//         employeeId = Number(req.params.id);
//       }

//       const date = req.query?.date ? String(req.query.date) : new Date().toISOString();
//       const data = await attendanceService.getAttendanceForDate(employeeId, date);

//       return res.json({ success: true, attendance: data });
//     } catch (err: any) {
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async getMonthlyStats(req: Request, res: Response) {
//     try {
//       const employeeId = Number(req.params.employeeId);
//       const year = Number(req.query.year);
//       const month = Number(req.query.month);

//       const stats = await attendanceService.getMonthlyStats(employeeId, year, month);

//       return res.status(200).json({ success: true, data: stats });
//     } catch (error: any) {
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: error.message
//       });
//     }
//   }
//  async getMonthlySummary(req: AuthenticatedEmployeeRequest, res: Response) {
//   try {
//     const employeeId = Number(req.employee?.id); // from JWT
//     const { year, month } = req.query as { year: string; month: string };

//     if (!employeeId || !year || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID, year, and month are required",
//       });
//     }

//     const attendance = await attendanceService.getMonthlyStats(employeeId, Number(year), Number(month));
//     const leave = await employeesService.getMonthlyApprovedLeaveCount(employeeId, Number(year), Number(month));

//     return res.json({
//       success: true,
//       employeeId,
//       year: Number(year),
//       month: Number(month),
//       attendance,
//       leave,
//     });

//   } catch (err: any) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// }


// }

// export default new AttendanceController();

// src/controller/attendance.controller.ts
import { Response, Request } from "express";
import ExcelJS from "exceljs";
import attendanceService from "../services/attendanceService";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import employeesService from "../services/employees.service";

class AttendanceController {

  // Helper: convert userId -> employeeId
  private async getEmployeeIdFromToken(req: AuthenticatedRequest): Promise<number | null> {
    const userId = Number(req.employee?.id);
    if (!userId) return null;

    const employee = await prisma.employeesDetail.findUnique({
      where: { userId }
    });

    return employee?.employeeId ?? null;
  }

async checkIn(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = Number(req.employee?.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const employee = await prisma.employeesDetail.findUnique({
      where: { userId }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee record not found"
      });
    }

    // ✅ SERVER TIME (UTC, correct)
    const now = new Date();

    const result = await attendanceService.checkIn(
      employee.employeeId,
      now
    );

    return res.json({ success: true, attendance: result });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}


async checkOut(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = Number(req.employee?.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const employee = await prisma.employeesDetail.findUnique({
      where: { userId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee record not found",
      });
    }

    const now = new Date();

    const attendance = await attendanceService.checkOut(
      employee.employeeId,
      now
    );

    return res.json({ success: true, attendance });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async getMyAttendance(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = Number(req.employee?.id);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const employee = await prisma.employeesDetail.findUnique({
        where: { userId },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee record not found",
        });
      }

      const { from, to } = req.query as { from?: string; to?: string };

      const data = await attendanceService.getAttendanceRange(
        employee.employeeId,
        from ?? "",
        to ?? ""
      );

      return res.json({ success: true, attendance: data });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAttendanceForEmployee(req: AuthenticatedRequest, res: Response) {
    try {
      const employeeId = Number(req.params.id);
      if (isNaN(employeeId)) {
        return res.status(400).json({ success: false, message: "Invalid employee id" });
      }

      const { from, to } = req.query as { from?: string; to?: string };
      const data = await attendanceService.getAttendanceRange(employeeId, from ?? "", to ?? "");

      return res.json({ success: true, attendance: data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
async downloadMyAttendanceExcel(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = Number(req.employee?.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const employee = await prisma.employeesDetail.findUnique({
      where: { userId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee record not found",
      });
    }

    // ✅ Fetch ALL completed attendance (exclude running punch)
const { from, to } = req.query as { from?: string; to?: string };

let startDate: Date | undefined;
let endDate: Date | undefined;

if (from && to) {
  startDate = new Date(from);
  endDate = new Date(to);
  endDate.setHours(23, 59, 59, 999); // include full end day
}

const records = await prisma.employeesAttendance.findMany({
  where: {
    employeeId: employee.employeeId,
    checkIn: { not: null },
    checkOut: { not: null },
    ...(startDate && endDate
      ? {
          checkIn: {
            gte: startDate,
            lte: endDate,
          },
        }
      : {}),
  },
  orderBy: { checkIn: "asc" },
});


   if (!records.length) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance Report");

  sheet.mergeCells("A1:E1");
  sheet.getCell("A1").value = "RED ANGLE STUDIO";
  sheet.getCell("A1").font = { size: 16, bold: true };
  sheet.getCell("A1").alignment = { horizontal: "center" };

  sheet.mergeCells("A2:E2");
  sheet.getCell("A2").value = "EMPLOYEE ATTENDANCE REPORT";
  sheet.getCell("A2").font = { size: 12, bold: true };
  sheet.getCell("A2").alignment = { horizontal: "center" };

  sheet.mergeCells("A4:E4");
  sheet.getCell("A4").value =
    "No completed attendance records available for the selected period";
  sheet.getCell("A4").alignment = { horizontal: "center" };

  sheet.columns = [
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 25 },
    { width: 15 },
  ];

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=attendance-report.xlsx"
  );

  await workbook.xlsx.write(res);
  return res.end();
}


    /* ================= EXCEL ================= */

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Attendance Report");

    // ---- TITLE ----
    sheet.mergeCells("A1:E1");
    sheet.getCell("A1").value = "RED ANGLE STUDIO";
    sheet.getCell("A1").font = { size: 16, bold: true };
    sheet.getCell("A1").alignment = { horizontal: "center" };

    sheet.mergeCells("A2:E2");
    sheet.getCell("A2").value = "EMPLOYEE ATTENDANCE REPORT";
    sheet.getCell("A2").font = { size: 12, bold: true };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    sheet.mergeCells("A4:E4");
    sheet.getCell("A4").value = `Generated On: ${new Date().toLocaleString(
      "en-IN",
      { timeZone: "Asia/Kolkata" }
    )}`;

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
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ---- DATA ----
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
        "Completed",
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

    // ---- COLUMN WIDTH ----
    sheet.columns = [
      { width: 15 },
      { width: 20 },
      { width: 20 },
      { width: 22 },
      { width: 15 },
    ];

    // ---- DOWNLOAD ----
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance-report.xlsx"
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

  async getAttendanceForDate(req: any, res: Response) {
    try {
      let employeeId: number;

      if (req.employee) {
        const emp = await prisma.employeesDetail.findUnique({
          where: { userId: Number(req.employee.id) }
        });
        if (!emp) {
          return res.status(401).json({ success: false, message: "Employee not found" });
        }
        employeeId = emp.employeeId;
      } else {
        employeeId = Number(req.params.id);
      }

      const date = req.query?.date ? String(req.query.date) : new Date().toISOString();
      const data = await attendanceService.getAttendanceForDate(employeeId, date);

      return res.json({ success: true, attendance: data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getMonthlyStats(req: Request, res: Response) {
    try {
      const employeeId = Number(req.params.employeeId);
      const year = Number(req.query.year);
      const month = Number(req.query.month);

      const stats = await attendanceService.getMonthlyStats(employeeId, year, month);

      return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }
 async getMonthlySummary(req: AuthenticatedRequest, res: Response) {
  try {
    const employeeId = Number(req.employee?.id); // from JWT
    const { year, month } = req.query as { year: string; month: string };

    if (!employeeId || !year || !month) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, year, and month are required",
      });
    }

    const attendance = await attendanceService.getMonthlyStats(employeeId, Number(year), Number(month));
    const leave = await employeesService.getMonthlyApprovedLeaveCount(employeeId, Number(year), Number(month));

    return res.json({
      success: true,
      employeeId,
      year: Number(year),
      month: Number(month),
      attendance,
      leave,
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}


}

export default new AttendanceController();