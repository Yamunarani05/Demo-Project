import { z } from "zod";

export const employeeProjectQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : 1))
    .refine((v) => v > 0, { message: "page must be > 0" }),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : 10))
    .refine((v) => v > 0 && v <= 100, {
      message: "limit must be between 1 and 100",
    }),
});

export const performanceQuerySchema = z.object({
  type: z.enum(["week", "month", "year"]).optional(),
});
