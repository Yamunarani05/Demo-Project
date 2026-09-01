// src/types/employeeValidation.ts
import { z } from "zod";
import { LeaveRequestStatus, UserRole } from "@prisma/client";

export const idParamSchema = z.object({
  id: z.coerce.number().refine((val) => !Number.isNaN(val), {
    message: "Invalid ID",
  }),
});

export const createEmployeeSchema = z
  .object({
    uniqueId: z.string().min(1),

    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(UserRole),

    firstName: z.string().min(1),
    lastName: z.string().min(1),

    contactNumber: z.string().optional(),
    address: z.string().optional(),
    workLocation: z.string(),

    salesType: z.string().optional(),
    position: z.string().optional(),

    experience: z.coerce.number().optional(),
    commission: z.coerce.number().optional(),

    dob: z.coerce.date().optional(),
    dateOfJoin: z.coerce.date().optional(),

    portfolioPath: z.string().optional(),
    photographyDescription: z.string().optional(),
  })
  .passthrough(); // 🔑 REQUIRED for file fields

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const createLeaveSchema = z.object({
  // employeeId removed – taken from JWT
  leaveType: z.string().min(1),
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
  noOfDays: z.coerce.number().int().positive().optional(),
  no_of_days: z.coerce.number().int().positive().optional(),
  reason: z.string().min(1),
});

export const leaveApprovalSchema = z.object({
  status: z.nativeEnum(LeaveRequestStatus),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
});

export const monthlyLeaveQuerySchema = z.object({
  year: z.coerce.number().min(2000),
  month: z.coerce.number().min(1).max(12),
});

export const annualLeaveQuerySchema = z.object({
  year: z.coerce.number().min(2000),
});

export const profileQuerySchema = z.object({
  include: z.string().optional(),
});

export type CreateEmployeeDTO = z.infer<typeof createEmployeeSchema>;
export type CreateLeaveDTO = z.infer<typeof createLeaveSchema>;
