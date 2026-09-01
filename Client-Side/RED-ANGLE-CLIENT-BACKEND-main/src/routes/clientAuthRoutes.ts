import express from "express";
import ClientAuthController from "../controller/clientAuthController";

const router = express.Router();

router.get("/verify", ClientAuthController.verify);
router.get("/me", ClientAuthController.getMe);
router.post("/set-password", ClientAuthController.setPassword);
// Note: We name this /login, but inside authRoutes or index.ts it's mounted under /client-auth
router.post("/login", ClientAuthController.login);

// Password Reset Flow
router.post("/forgot-password", ClientAuthController.forgotPassword);
router.post("/verify-otp", ClientAuthController.verifyOtp);
router.post("/reset-password", ClientAuthController.resetPassword);

export default router;
