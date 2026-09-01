import { z } from "zod";

/* ================= PARAMS ================= */

// :id (admin routes for specific employee)
export const employeeIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// :employeeId (monthly stats route)
export const employeeIdAltParamSchema = z.object({
  employeeId: z.coerce.number().int().positive(),
});

/* ================= BODY ================= */

// Check-in / Check-out payload
export const attendanceActionSchema = z.object({
 timestamp: z.coerce.date().optional(),
 // ISO string, optional
});

/* ================= QUERY ================= */

// Attendance range query
export const attendanceRangeQuerySchema = z.object({
 from: z.coerce.date(),
to: z.coerce.date(),
});

// Attendance for a specific date
export const attendanceDateQuerySchema = z.object({
  date: z.coerce.date().optional(),
});

// Monthly stats
export const monthlyAttendanceQuerySchema = z.object({
  year: z.coerce.number().int().min(2000),
  month: z.coerce.number().int().min(1).max(12),
});

// Monthly summary query (for employee/admin)
export const monthlySummaryQuerySchema = z.object({
  year: z.coerce.number().int().min(2000),
  month: z.coerce.number().int().min(1).max(12),
});

/* ================= TYPES ================= */

export type AttendanceActionDTO = z.infer<typeof attendanceActionSchema>;
export type AttendanceRangeQueryDTO = z.infer<typeof attendanceRangeQuerySchema>;
export type MonthlyAttendanceQueryDTO = z.infer<typeof monthlyAttendanceQuerySchema>;
export type MonthlySummaryQueryDTO = z.infer<typeof monthlySummaryQuerySchema>;