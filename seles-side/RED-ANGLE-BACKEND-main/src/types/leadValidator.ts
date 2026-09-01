import { z } from "zod";
import { LeadStage } from "@prisma/client";

/* ---------- PARAMS ---------- */
export const leadIdParamSchema = z.object({
  leadId: z.coerce.number().int().positive(),
});

export const employeeIdParamSchema = z.object({
  employeeId: z.coerce.number().int().positive(),
});

/* ---------- QUERY ---------- */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

export const dateRangeQuerySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

/* ---------- CREATE LEAD ---------- */
export const createLeadSchema = z.object({
  firstName: z.string().optional(),
  assigneeId: z.coerce.number().int().positive().optional(),
  lastName: z.string().optional(),
  email: z.string().optional().or(z.literal("")),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  eventType: z.string().optional(),
  leadSource: z.string().optional(),
  priority: z.string().optional(),
  budget: z.coerce.number().optional(),
  discount: z.coerce.number().optional(),
  eventDate: z.coerce.date().optional(),
  weddingDate: z.coerce.date().optional(),
  receptionDate: z.coerce.date().optional(),
  leadType: z.string().optional().default("LD"),
  leadSerialNumber: z.string().trim().max(20).optional().or(z.literal("")),
  description: z.string().optional(),
});

/* ---------- UPDATE LEAD ---------- */
export const updateLeadSchema = createLeadSchema.extend({
  paidAmount: z.coerce.number().optional(),
  currentStage: z.nativeEnum(LeadStage).optional(),
});

export const leadEarningsQuerySchema = z.object({
  employeeId: z.coerce.number().int().positive().optional,
});
/* ---------- ASSIGN EMPLOYEE ---------- */
export const assignEmployeeSchema = z.object({
  leadId: z.coerce.number().int().positive(),
  employeeId: z.coerce.number().int().positive(),
  taskName: z.string().optional(),
  EstimatedDuration: z.coerce.number().optional(),
  deadline: z.coerce.date().optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  description: z.string().optional(),
});

export const updateAssignEmployeeSchema = z.object({
  employeeId: z.coerce.number().int().positive(),
});
export const emptySchema = z.object({}).strict();

/* ---------- LEAD STAGE PARAM ---------- */
export const leadStageParamSchema = z.object({
  stage: z.nativeEnum(LeadStage),
});

/* ---------- LEAD STAGES BODY ---------- */
export const leadStagesBodySchema = z.object({
  stages: z.array(z.nativeEnum(LeadStage)).min(1, "At least one stage is required"),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});


