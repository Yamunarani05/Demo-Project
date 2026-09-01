import z from "zod";

export const idParamSchema = z.object({
  invoiceId: z.coerce.number().int().positive(),
});

export const tokenParamSchema = z.object({
  token: z.string().min(1),
});

export const createInvoiceSchema = z.object({
  leadId: z.number().int().positive(),
  billingDate: z.union([z.string(), z.date()]),
  plan: z.string().min(1),
  status: z.string().optional(),
  packages: z
    .array(
      z.object({
        packageId: z.number().int().positive(),
        status: z.string().min(1),
        unit: z.number().int().positive(),
      })
    )
    .nonempty(),
  addons: z
    .array(
      z.object({
        addonServiceId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .optional(),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        category: z.string().optional(),
      })
    )
    .optional(),
});

export const createInvoiceIssueSchema = z.object({
  issueTitle: z.string().min(1),
  description: z.string().min(1),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export const updateInvoiceSchema = z.object({
  billingDate: z.union([z.string(), z.date()]).optional(),
  plan: z.string().optional(),
  status: z.string().optional(),
  packages: z
    .array(
      z.object({
        packageId: z.number().int().positive(),
        status: z.string().min(1),
        unit: z.number().int().positive(),
      })
    )
    .optional(),
  addons: z
    .array(
      z.object({
        addonServiceId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .optional(),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        category: z.string().optional(),
      })
    )
    .optional(),
});
