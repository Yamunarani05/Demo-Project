// src/components/auth/RequireAuth.tsx
import type { ReactNode } from "react";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { tokenService } from "../../Services/tokenService";

interface RequireAuthProps {
  allowedRoles: string[]; // admin, employee, partner
  children: ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({
  allowedRoles,
  children,
}) => {
  const location = useLocation();
  const token = tokenService.getToken();
  const role = tokenService.getRole(); // string | null

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
