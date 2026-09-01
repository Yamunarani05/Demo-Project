import { z } from "zod";

export const issueIdParamSchema = z.object({
  issueId: z.coerce.number().int().positive(),
});

export const quotationLeadIdParamSchema = z.object({
  quotationLeadId: z.coerce.number().int().positive(),
});

export const quotationIssuePaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});


export const createQuotationIssueSchema = z.object({
  issueTitle: z.string().min(3, "Issue title is required"),
  description: z.string().optional(),
  quotationLeadId: z.number().int().positive(),
  status: z.string().optional(),
});

export const updateQuotationIssueSchema = z.object({
  issueTitle: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.enum(["Open", "Closed", "Resolved"]).optional(),
});
