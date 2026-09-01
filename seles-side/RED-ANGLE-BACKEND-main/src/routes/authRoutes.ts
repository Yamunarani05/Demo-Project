import { Router } from "express";
import AuthController from "../controller/authController";
import { validateBody } from "../middleware/validation";
import { forgotPasswordSchema, resetPasswordSchema } from "../types/authValidator";

const router = Router();

/* FORGOT PASSWORD */
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  AuthController.forgotPassword
);

/* RESET PASSWORD */
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  AuthController.resetPassword
);

export default router;
