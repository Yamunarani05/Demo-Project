import { Request, Response } from "express";
import loginAuthService from "../services/loginAuthService";

interface GoogleAuthRequest {
  token: string;
}

export class LoginAuthController {
  // Email/password login
  static async login(req: Request, res: Response) {
    try {
      const result = await loginAuthService.login(req.body);
      return res.status(200).json({
        success: true,
        message: `${result.role} login successful`,
        ...result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }

  // Google login
  static async googleLogin(req: Request<{}, {}, GoogleAuthRequest>, res: Response) {
    try {
      const result = await loginAuthService.googleLogin(req.body);
      return res.status(200).json({
        success: true,
        message: `${result.role} login successful`,
        ...result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
}

export default LoginAuthController;
