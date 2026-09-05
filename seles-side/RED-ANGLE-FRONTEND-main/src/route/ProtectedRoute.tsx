import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Array<"admin" | "employee" | "partner">;
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");
  const rawRole = localStorage.getItem("role");
  const role = rawRole ? rawRole.toLowerCase().trim() : "";

  useLocation();
  const hasShownToast = useRef(false);

  useEffect(() => {
    // If real authorized token is present, ensure demo flag is cleared so authorized portals are undisturbed
    if (token && token !== "demo-portal-token" && !token.startsWith("demo-")) {
      if (localStorage.getItem("isDemoPortal")) {
        localStorage.removeItem("isDemoPortal");
      }
    }

    if (!token && !hasShownToast.current) {
      toast.error("Please login to continue");
      hasShownToast.current = true;
    } else if (token && role && !allowedRoles.includes(role as any) && !hasShownToast.current) {
      toast.error("You are not authorized to access this page");
      hasShownToast.current = true;
    }
  }, [token, role, allowedRoles]);

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ❌ Logged in but wrong role
  if (!role || !allowedRoles.includes(role as any)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized
  return <>{children}</>;
};

export default ProtectedRoute;
