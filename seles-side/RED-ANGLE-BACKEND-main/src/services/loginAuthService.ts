import prisma from "../config/prisma";
import { comparePassword, generateEmployeeToken, generatePartnerToken, generateAdminToken } from "../util/auth";
import { OAuth2Client, TokenPayload } from "google-auth-library";

export const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface LoginPayload {
  email: string;
  password: string;
}

interface GoogleLoginPayload {
  token: string;
}

class LoginAuthService {
  // Email/Password Login
  async login({ email, password }: LoginPayload) {
    if (!email || !password) throw new Error("Email and password are required");

    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email.trim(), mode: "insensitive" }
      },
      include: { employeesDetail: true },
    });

    if (!user) throw new Error("Invalid credentials");

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const fullName = user.employeesDetail
      ? `${user.employeesDetail.firstName} ${user.employeesDetail.lastName ?? ""}`.trim()
      : user.role.charAt(0).toUpperCase() + user.role.slice(1);

    let token: string;
    switch (user.role) {
      case "admin":
        token = generateAdminToken({ id: String(user.userId), email: user.email, name: fullName });
        break;
      case "employee":
        token = generateEmployeeToken({ id: String(user.userId), email: user.email, name: fullName });
        break;
      case "partner":
        token = generatePartnerToken({ id: String(user.userId), email: user.email, name: fullName, role: "partner" });
        break;
      default:
        throw new Error("Invalid role");
    }

    return { token, role: user.role, userId: user.userId, fullName };
  }

  // Google OAuth Login
  async googleLogin({ token }: GoogleLoginPayload) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not set in environment variables");
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID, // TypeScript now knows it's a string
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new Error("Invalid Google token");

  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: { employeesDetail: true },
  });

  if (!user) throw new Error("User not found");

  const fullName = user.employeesDetail
    ? `${user.employeesDetail.firstName} ${user.employeesDetail.lastName ?? ""}`.trim()
    : user.role.charAt(0).toUpperCase() + user.role.slice(1);

  let JwtToken: string;
  switch (user.role) {
    case "admin":
      JwtToken = generateAdminToken({ id: String(user.userId), email: user.email, name: fullName });
      break;
    case "employee":
      JwtToken = generateEmployeeToken({ id: String(user.userId), email: user.email, name: fullName });
      break;
    case "partner":
      JwtToken = generatePartnerToken({ id: String(user.userId), email: user.email, name: fullName, role: "partner" });
      break;
    default:
      throw new Error("Invalid role");
  }

  return { token: JwtToken, role: user.role, userId: user.userId, fullName };
}

}

export default new LoginAuthService();
