import { z } from "zod";

export const createAdminSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .transform((v) => v.toLowerCase()),

  name: z
    .string()
    .min(1, "Name is required"),

  lastName: z
    .string()
    .optional()
    .or(z.literal(""))
    .nullable(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const adminLoginSchema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .transform((v) => v.toLowerCase()),

  password: z.string().min(1, "Password is required"),
});
