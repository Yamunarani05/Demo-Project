import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const googleLoginSchema = z.object({
  token: z.string().min(1, "Google token is required"),
});
