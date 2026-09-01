import prisma from "../config/prisma";
import { LeaveRequestStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

class EmployeeService {

  async createEmployee(data: any, createdBy: number) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    

    return prisma.user.create({
      data: {
        uniqueId: data.uniqueId,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role,
        employeesDetail: {
  create: {
    firstName: data.firstName,
    lastName: data.lastName,
    contactNumber: data.contactNumber,
    dob: data.dob,
    address: data.address,
    workLocation: data.workLocation,
    salesType: data.salesType,
    experience: data.experience,
    dateOfJoin: data.dateOfJoin,
    portfolioPath: data.portfolioPath,
    photographyDescription: data.photographyDescription,
    position: data.position,
    commission: data.commission,
    createdBy,

    // ✅ ADD THESE
    profileImagePath: data.profileImagePath,
    documentPdfPath: data.documentPdfPath,
  },
},
      },
      include: { employeesDetail: true },
    });
  }

  async getAllEmployees(limit?: number, skip?: number, search?: string) {
    const where: any = { isDeleted: false };

    if (search?.trim()) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { contactNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const employees = await prisma.employeesDetail.findMany({
      where,
      take: limit,
      skip,
      include: {
        user: {
          select: { userId: true, email: true, role: true },
        },
      },
    });

    const total = await prisma.employeesDetail.count({ where });

    return { employees, total };
  }

  async getEmployeeById(employeeId: number) {
    return prisma.employeesDetail.findUnique({
      where: { employeeId },
      include: { user: true },
    });
  }

  async updateEmployee(employeeId: number, data: any) {
    return prisma.employeesDetail.update({
      where: { employeeId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        contactNumber: data.contactNumber,
        workLocation: data.workLocation,
        profileImagePath: data.profileImagePath,
        documentPdfPath: data.documentPdfPath,
      },
      include: {
        user: {
          select: { userId: true, email: true, role: true },
        },
      },
    });
  }

  async deleteEmployee(employeeId: number) {
    return prisma.employeesDetail.update({
      where: { employeeId },
      data: { isDeleted: true, isActive: false },
    });
  }

  async getEmployeeProfileByUserId(userId: number) {
    return prisma.employeesDetail.findFirst({
      where: { userId },
      include: {
        user: { select: { userId: true, email: true, role: true } },
      },
    });
  }

  /* ================= 🔑 USER → EMPLOYEE ================= */

async getEmployeeIdByUserId(userId: number): Promise<number> {
  const employee = await prisma.employeesDetail.findFirst({
    where: { userId },
    select: { employeeId: true },
  });

  if (!employee) {
    throw new Error("Employee record not found for user");
  }

  return employee.employeeId;
}

  /* ================= LEAVES ================= */

  async EmployeeLeaves(data: any, createdByUserId: number) {
    const employeeId = await this.getEmployeeIdByUserId(createdByUserId);

    return prisma.employeeLeaveRequests.create({
      data: {
        employeeId,
        leaveType: data.leaveType,
        fromDate: data.fromDate,
        toDate: data.toDate,
        noOfDays: data.noOfDays ?? data.no_of_days,
        reason: data.reason,
        createdBy: createdByUserId,
      },
    });
  }

  async EmployeeLeavesApprove(id: number, status: LeaveRequestStatus) {
    return prisma.employeeLeaveRequests.update({
      where: { leaveRequestId: id },
      data: { status },
    });
  }

  async getEmployeeLeavesById(leaveRequestId: number) {
    return prisma.employeeLeaveRequests.findUnique({
      where: { leaveRequestId },
    });
  }

async getEmployeeLeaves(
  userRole: "admin" | "employee" | "partner",
  employeeId: number | null,
  limit: number,
  skip: number,
  search: string
) {
  const whereCondition: any = {};

  if (userRole === "employee" && employeeId) {
    whereCondition.employeeId = employeeId;
  }

  if (search?.trim()) {
    whereCondition.OR = [
      { leaveType: { contains: search, mode: "insensitive" } },
      { reason: { contains: search, mode: "insensitive" } },
      { status: { contains: search, mode: "insensitive" } },
    ];
  }

const leaves = await prisma.employeeLeaveRequests.findMany({
  where: whereCondition,
  take: limit,
  skip,
  orderBy: { leaveRequestId: "desc" },
  include: {
    employee: {
      select: {
        employeeId: true,
        firstName: true,
        lastName: true,
      },
    },
  },
});


  const total = await prisma.employeeLeaveRequests.count({
    where: whereCondition,
  });

  return {
    leaves,
    pagination: {
      total,
      limit,
      skip,
      pages: Math.ceil(total / limit),
    },
  };
}

  /* ================= STATS ================= */

  async getMonthlyApprovedLeaveCount(employeeId: number, year: number, month: number) {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(startDate);

    return {
      employeeId,
      year,
      month,
      approvedLeaveCount: await prisma.employeeLeaveRequests.count({
        where: {
          employeeId,
          status: LeaveRequestStatus.Approved,
          fromDate: { lte: endDate },
          toDate: { gte: startDate },
        },
      }),
      pendingCount: await prisma.employeeLeaveRequests.count({
        where: {
          employeeId,
          status: LeaveRequestStatus.Pending,
          fromDate: { lte: endDate },
          toDate: { gte: startDate },
        },
      }),
      rejectedCount: await prisma.employeeLeaveRequests.count({
        where: {
          employeeId,
          status: LeaveRequestStatus.Rejected,
          fromDate: { lte: endDate },
          toDate: { gte: startDate },
        },
      }),
    };
  }

  async getAnnualLeaveSummary(employeeId: number, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    return {
      employeeId,
      year,
      approvedCount: await prisma.employeeLeaveRequests.count({
        where: {
          employeeId,
          status: "Approved",
          fromDate: { lte: endDate },
          toDate: { gte: startDate },
        },
      }),
      pendingCount: await prisma.employeeLeaveRequests.count({
        where: {
          employeeId,
          status: "Pending",
          fromDate: { lte: endDate },
          toDate: { gte: startDate },
        },
      }),
      rejectedCount: await prisma.employeeLeaveRequests.count({
        where: {
          employeeId,
          status: "Rejected",
          fromDate: { lte: endDate },
          toDate: { gte: startDate },
        },
      }),
    };
  }

  /* ================= REPORT ================= */

  async getDailyReport(date: Date) {
    const targetDate = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ));

    const totalEmployees = await prisma.employeesDetail.count({
      where: { isDeleted: false },
    });

    const attendanceRecords = await prisma.employeesAttendance.findMany({
      where: { date: targetDate },
    });

    const presentCount = attendanceRecords.length;

    return {
      totalEmployees,
      presentCount,
      absentCount: totalEmployees - presentCount,
      date: date.toISOString().split("T")[0],
      attendanceRecords,
    };
  }

  /* ================= 🔗 EMPLOYEE-USER LINK REPAIR ================= */

  /**
   * Repair broken employee-user links by matching email addresses
   * Useful when employees were created without proper userId links
   */
  async repairEmployeeUserLinks() {
    const orphanedEmployees = await prisma.employeesDetail.findMany({
      where: { userId: null },
      select: {
        employeeId: true,
        user: {
          select: {
            userId: true,
            email: true,
          },
        },
      },
    });

    let repairCount = 0;
    for (const emp of orphanedEmployees) {
      if (emp.user?.userId) {
        await prisma.employeesDetail.update({
          where: { employeeId: emp.employeeId },
          data: { userId: emp.user.userId },
        });
        repairCount++;
      }
    }

    return { repaired: repairCount, total: orphanedEmployees.length };
  }

  /**
   * Get employee by employeeId or by userId
   * Tries multiple lookup strategies to handle data inconsistencies
   */
  async getEmployeeByIdOrUserId(
    employeeIdOrUserId: number,
    isEmployeeId: boolean = true
  ) {
    let employee: any;

    if (isEmployeeId) {
      // First try direct lookup by employeeId
      employee = await prisma.employeesDetail.findUnique({
        where: { employeeId: employeeIdOrUserId },
        include: { user: { select: { userId: true, email: true } } },
      });
    } else {
      // Lookup by userId
      employee = await prisma.employeesDetail.findUnique({
        where: { userId: employeeIdOrUserId },
        include: { user: { select: { userId: true, email: true } } },
      });
    }

    return employee;
  }
}

export default new EmployeeService();