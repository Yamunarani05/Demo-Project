import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { 
  sendEmail,
  createPasswordResetEmailContent
} from "../util/emailService";


class AuthController {
 static async forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({
        success: true,
        message: "If the email exists, reset link sent",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
const otpCode = rawToken.slice(0, 6).toUpperCase();

const emailBody = createPasswordResetEmailContent(
  user.email,
  otpCode,
  resetLink
);

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      body: emailBody,
      isHTML: true,
    });

    return res.json({
      success: true,
      message: "Reset link sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Token and new password are required",
        });
      }

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await prisma.user.findFirst({
        where: {
          resetToken: hashedToken,
          resetTokenExpiry: { gt: new Date() },
        },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { userId: user.userId },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return res.json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export default AuthController;
