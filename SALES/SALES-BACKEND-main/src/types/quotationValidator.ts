import { z } from "zod";

// Create quotation schema
export const createQuotationSchema = z.object({
  leadId: z.number().positive("Lead ID must be a positive number"),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      quantity: z.number().positive("Quantity must be positive"),
      unitPrice: z.number().positive("Unit price must be positive"),
    })
  ),
  discountPercent: z.number().min(0).max(100).optional(),
  taxPercent: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export type CreateQuotationRequest = z.infer<typeof createQuotationSchema>;

// Update quotation schema
export const updateQuotationSchema = z.object({
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().positive("Quantity must be positive"),
        unitPrice: z.number().positive("Unit price must be positive"),
      })
    )
    .optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  taxPercent: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  sendEmailToClient: z.boolean().optional(),
});

export type UpdateQuotationRequest = z.infer<typeof updateQuotationSchema>;

// Quotation ID params
export const quotationIdParamsSchema = z.object({
  quotationId: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "quotationId must be a positive number"
  ),
});

export type QuotationIdParams = z.infer<typeof quotationIdParamsSchema>;

// Quotation Lead ID params
export const quotationLeadIdParamsSchema = z.object({
  quotationLeadId: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "quotationLeadId must be a positive number"
  ),
});

export type QuotationLeadIdParams = z.infer<typeof quotationLeadIdParamsSchema>;

// Lead ID params
export const leadIdParamsSchema = z.object({
  leadId: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "leadId must be a positive number"
  ),
});

export type LeadIdParams = z.infer<typeof leadIdParamsSchema>;

// Send quotation to client schema
export const sendQuotationSchema = z.object({
  quotationId: z.number().positive("Quotation ID must be a positive number"),
  leadIds: z.array(z.number().positive()).optional(),
});

export type SendQuotationRequest = z.infer<typeof sendQuotationSchema>;

// Update approval status schema
export const updateApprovalStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "pending"]).catch("pending"),
  remarks: z.string().optional(),
});

export type UpdateApprovalStatusRequest = z.infer<typeof updateApprovalStatusSchema>;

// Update lead schema
export const updateLeadSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.string().datetime().optional(),
});

export type UpdateLeadRequest = z.infer<typeof updateLeadSchema>;

// Get quotation IDs query schema
export const getQuotationIdsSchema = z.object({});

export type GetQuotationIdsQuery = z.infer<typeof getQuotationIdsSchema>;

// Get all quotations query schema
export const getAllQuotationsSchema = z.object({
  page: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 1),
      "Page must be a positive number"
    ),
  limit: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 1),
      "Limit must be a positive number"
    ),
  search: z.string().optional(),
  status: z.enum(["approved", "rejected", "pending"]).optional(),
});

export type GetAllQuotationsQuery = z.infer<typeof getAllQuotationsSchema>;
