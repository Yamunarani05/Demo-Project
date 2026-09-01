import { Router } from "express";
import LoginAuthController from "../controller/loginAuthController";
import { validateBody } from "../middleware/validation";
import { loginSchema, googleLoginSchema } from "../types/loginValidator";

const router = Router();

router.post(
  "/",
  validateBody(loginSchema),
  LoginAuthController.login
);

router.post(
  "/google",
  validateBody(googleLoginSchema),
  LoginAuthController.googleLogin
);

export default router;
