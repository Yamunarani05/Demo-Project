import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../config/prisma";
import { generateAdminToken } from "../util/auth";
import { ENV } from "../config/env";

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminResponse {
  id: number;
  email: string;
  name: string;          // static “admin”
  isActive: boolean;     // always true for admin
  createdAt: Date | null;
}

export interface AdminLoginResponse {
  admin: AdminResponse;
  token: string;
}

export class AdminService {

  // --------------------------
  // LOGIN ADMIN
  // --------------------------
  static async loginAdmin(
    loginData: AdminLoginData
  ): Promise<AdminLoginResponse> {
    const { email, password } = loginData;

    const admin = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin || admin.role !== "admin") {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) throw new Error("Invalid email or password");

    // Token
    const token = generateAdminToken({
      id: admin.userId.toString(),
      email: admin.email,
      name: "admin",
    });

    const adminResponse: AdminResponse = {
      id: admin.userId,
      email: admin.email,
      name: "admin",
      isActive: true,
      createdAt: admin.createdAt,
    };

    return { admin: adminResponse, token };
  }

  // --------------------------
  // CREATE ADMIN -- FIXED
  // --------------------------
  static async createAdmin(adminData: {
    email: string;
    name: string;        // we accept it, but we do NOT store it in DB
    lastName?: string;   // ignore this too
    password: string;
  }): Promise<AdminResponse> {
    const { email, password } = adminData;

    const existingAdmin = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingAdmin) throw new Error("Admin with this email already exists");

    const hashedPassword = await bcrypt.hash(
      password,
      Number(ENV.BCRYPT_SALT_ROUNDS)
    );

    // ❌ removed employeesDetail (admin should not store there)
    const admin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        role: "admin",
        uniqueId: crypto.randomUUID(),
      },
    });

    return {
      id: admin.userId,
      email: admin.email,
      name: "admin",
      isActive: true,
      createdAt: admin.createdAt,
    };
  }

  // --------------------------
  // GET ADMIN BY ID
  // --------------------------
  static async getAdminById(adminId: number): Promise<AdminResponse | null> {
    const admin = await prisma.user.findUnique({
      where: { userId: adminId },
    });

    if (!admin || admin.role !== "admin") return null;

    return {
      id: admin.userId,
      email: admin.email,
      name: "admin",
      isActive: true,
      createdAt: admin.createdAt,
    };
  }

  // --------------------------
  // VERIFY ADMIN
  // --------------------------
  static async verifyAdmin(adminId: number): Promise<boolean> {
    const admin = await prisma.user.findUnique({
      where: { userId: adminId },
    });

    return admin?.role === "admin";
  }
}
