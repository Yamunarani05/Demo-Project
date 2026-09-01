// src/Services/AuthenticationService.ts
import axios from "axios";
import { tokenService, type UserRole } from "./tokenService";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  role?: string;
  userId?: string | number;
  fullName?: string;
  name?: string;
  id?: string | number;
  user?: any;
  employeeId?: string | number;
}

export const AuthenticationService = {
  async loginWithEmailPassword(email: string, password: string) {
    try {
      const payload: LoginPayload = { email, password };

      const res = await axios.post<LoginResponse>(
        `${API_URL}/login`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = res.data;

      const token = data.token;
      const role = (data.role || data.user?.role) as UserRole | undefined;
      const fullName =
        data.fullName || data.name || data.user?.name || "User";
      const rawUserId = data.userId ?? data.id ?? data.user?.id;

      if (!token || !role) {
        throw new Error("Invalid login response: missing token or role");
      }

      const userId: string =
        rawUserId !== undefined && rawUserId !== null
          ? String(rawUserId)
          : "0";

      // persist auth basics using tokenService (writes "token" / "role")
      tokenService.setAuth({
        token,
        role,
        fullName,
        userId,
      });

      // if backend includes employeeId in login response, store it
      const rawEmployeeId =
        (data as any).employeeId ??
        (data.user as any)?.employeeId ??
        (data.user as any)?.employeesDetail?.employeeId;

      if (role === "employee" && rawEmployeeId != null) {
        tokenService.setEmployeeId(String(rawEmployeeId));
      }

      return { role, token, userId, fullName };
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";
      throw new Error(message);
    }
  },

  logout() {
    tokenService.clearAuth();
  },
};
