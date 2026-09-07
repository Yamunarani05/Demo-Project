import { z } from "zod";

export const createAdminSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .transform((v) => v.toLowerCase()),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  lastName: z
    .string()
    .min(1)
    .optional(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const adminLoginSchema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .transform((v) => v.toLowerCase()),

  password: z.string().min(1, "Password is required"),
});
