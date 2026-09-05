// src/Services/tokenService.ts

export type UserRole = "admin" | "employee" | "partner";

export interface StoredAuth {
  token: string;
  role: UserRole;
  fullName: string;
  userId: string; // stored as string in localStorage
}

// IMPORTANT: align with Login.tsx and axios.ts which use "token" and "role"
const ACCESS_TOKEN_KEY = "token";        // was "accessToken"
const ROLE_KEY = "role";                 // was "userRole"
const FULL_NAME_KEY = "fullName";
const USER_ID_KEY = "userId";
const EMPLOYEE_ID_KEY = "employeeId";

export const tokenService = {
  setAuth(auth: StoredAuth): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, auth.token);
    localStorage.setItem(ROLE_KEY, auth.role);
    localStorage.setItem(FULL_NAME_KEY, auth.fullName);
    localStorage.setItem(USER_ID_KEY, auth.userId);
  },

  getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRole(): UserRole | null {
    const role = localStorage.getItem(ROLE_KEY);
    return role as UserRole | null;
  },

  getFullName(): string | null {
    return localStorage.getItem(FULL_NAME_KEY);
  },

  getUserId(): string | null {
    return localStorage.getItem(USER_ID_KEY);
  },

  getEmployeeId(): string | null {
    return localStorage.getItem(EMPLOYEE_ID_KEY);
  },

  setEmployeeId(id: string): void {
    localStorage.setItem(EMPLOYEE_ID_KEY, id);
  },

  clearAuth(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(FULL_NAME_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(EMPLOYEE_ID_KEY);
    localStorage.removeItem("isDemoPortal");
  },

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
