import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";

// JWT payload interface for Admin
export interface AdminJWTPayload {
  id: string;
  email: string;
  name: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

// JWT payload interface for Employee
export interface EmployeeJWTPayload {
  id: string;
  
  email: string;
  name: string;
  role: "employee";
  iat?: number;
  exp?: number;
}
// JWT payload interface for Partner
export interface PartnerJWTPayload {
  id: string;
  email: string;
  name: string;
  role: "partner";
  iat?: number;
  exp?: number;
}

// JWT payload interface for Client
export interface ClientJWTPayload {
  id: string;
  email: string;
  name: string;
  role: "client";
  iat?: number;
  exp?: number;
}

// Generate JWT token for admin
export const generateAdminToken = (payload: Omit<AdminJWTPayload, 'iat' | 'exp' | 'role'>): string => {
  return jwt.sign({ ...payload, role: 'admin' }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Generate JWT token for employee
export const generateEmployeeToken = (payload: Omit<EmployeeJWTPayload, 'iat' | 'exp' | 'role'>): string => {
  return jwt.sign({ ...payload, role: 'employee' }, ENV.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Generate JWT token (backward compatibility)
export const generatePartnerToken = (payload: Omit<PartnerJWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign({ ...payload, role: 'partner' }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Generate JWT token for client
export const generateClientToken = (payload: Omit<ClientJWTPayload, 'iat' | 'exp' | 'role'>): string => {
  return jwt.sign({ ...payload, role: 'client' }, ENV.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Verify JWT token (admin)
export const verifyAdminToken = (token: string): AdminJWTPayload => {
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as AdminJWTPayload;
    if (payload.role !== 'admin') {
      throw new Error('Invalid token type');
    }
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Verify JWT token (Partner)
export const verifyPartnerToken = (token: string): PartnerJWTPayload => {
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as PartnerJWTPayload;
    if (payload.role !== 'partner') {
      throw new Error('Invalid token type');
    }
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
// Verify Employee token 
export const verifyEmployeeToken = (token: string): EmployeeJWTPayload => {
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as EmployeeJWTPayload;
    if (payload.role !== 'employee') {
      throw new Error('Invalid token type');
    }
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Verify Client token 
export const verifyClientToken = (token: string): ClientJWTPayload => {
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as ClientJWTPayload;
    if (payload.role !== 'client') {
      throw new Error('Invalid token type');
    }
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, ENV.BCRYPT_SALT_ROUNDS);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
};

// OTP Utilities
import crypto from "crypto";
import { ENV } from "../config/env";

// Generate secure 6-digit OTP
export const generateSecureOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Hash OTP for secure storage
export const hashOTP = async (otp: string): Promise<string> => {
  return await bcrypt.hash(otp, ENV.BCRYPT_SALT_ROUNDS);
};

// Verify OTP against hashed version
export const verifyOTP = async (otp: string, hashedOTP: string): Promise<boolean> => {
  return await bcrypt.compare(otp, hashedOTP);
};
