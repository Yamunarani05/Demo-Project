// import { Request, Response, NextFunction } from "express";
// import { AdminJWTPayload, EmployeeJWTPayload, extractTokenFromHeader, PartnerJWTPayload, verifyAdminToken, verifyPartnerToken, verifyEmployeeToken } from "../util/auth";
// import { ApiResponse } from "../types/response";

// // Extended Request interface to include admin data
// export interface AuthenticatedAdminRequest extends Request {
//   admin?: AdminJWTPayload;
// }

// // Extended Request interface to include member data
// export interface AuthenticatedPartnerRequest extends Request {
//   partner?: PartnerJWTPayload;
// }
// export interface AuthenticatedEmployeeRequest extends Request {
//     employee?: EmployeeJWTPayload;
//   }
//   export type AuthenticatedUserRequest = AuthenticatedAdminRequest & AuthenticatedPartnerRequest & AuthenticatedEmployeeRequest;

// // Authentication middleware with JWT
// export const authenticateAdmin = async (
//   req: AuthenticatedAdminRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = extractTokenFromHeader(authHeader);

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//         error: "Authorization token is required",
//       } as ApiResponse<null>);
//     }

//     // Verify JWT token
//     const payload = verifyAdminToken(token) as AdminJWTPayload;
//     // Verify it's an admin token (if role is present)
//     if (payload.role && payload.role !== "admin") {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied",
//         error: "Admin authentication is required",
//       } as ApiResponse<null>);
//     }

//     // Attach admin data to request
//     req.admin = {
//       id: payload.id,
//       email: payload.email,
//       name: payload.name,
//       role: "admin",
//     };

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: "Authentication failed",
//       error: "Invalid or expired token",
//     } as ApiResponse<null>);
//   }
// };


// // User authentication middleware with JWT
// export const authenticatePartner = async (
//   req: AuthenticatedPartnerRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = extractTokenFromHeader(authHeader);

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//         error: "Authorization token is required",
//       } as ApiResponse<null>);
//     }

//     // Verify member JWT token
//     const payload = verifyPartnerToken(token) as PartnerJWTPayload;

//     // Attach member data to request
//     req.partner = {
//       id: payload.id,
//       email: payload.email,
//       name: payload.name,
//       role: "partner",
//     };

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: "Authentication failed",
//       error: "Invalid or expired token",
//     } as ApiResponse<null>);
//   }
// };
// export const authenticateEmployee = async (
//   req: AuthenticatedEmployeeRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = extractTokenFromHeader(authHeader);

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//         error: "Authorization token is required",
//       } as ApiResponse<null>);
//     }

//     // Verify partner JWT token
//     const payload = verifyEmployeeToken(token) as EmployeeJWTPayload;

//     // Attach partner data to request
//     req.employee = {
//       id: payload.id,
//       email: payload.email,
//       name: payload.name,
     
//       role: "employee",
//     };

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: "Authentication failed",
//       error: "Invalid or expired token",
//     } as ApiResponse<null>);
//   }
// };

// export const authenticateAny = (
//   req: Request & { admin?: any; partner?: any; employee?: any },
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers.authorization;
//   const token = extractTokenFromHeader(authHeader);

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Authentication required",
//     });
//   }

//   try {
//     const payload = verifyAdminToken(token);
//     req.admin = { ...payload, role: "admin" };
//     return next();
//   } catch {}

//   try {
//     const payload = verifyPartnerToken(token);
//     req.partner = { ...payload, role: "partner" };
//     return next();
//   } catch {}

//   try {
//     const payload = verifyEmployeeToken(token);
//     req.employee = { ...payload, role: "employee" };
//     return next();
//   } catch {}

//   return res.status(401).json({
//     success: false,
//     message: "Invalid or expired token",
//   });
// };

import { Request, Response, NextFunction } from "express";
import {
  AdminJWTPayload,
  PartnerJWTPayload,
  EmployeeJWTPayload,
  extractTokenFromHeader,
  verifyAdminToken,
  verifyPartnerToken,
  verifyEmployeeToken,
} from "../util/auth";
import { ApiResponse } from "../types/response";

/* =========================================================
   ✅ UNIVERSAL AUTH REQUEST (USE EVERYWHERE)
========================================================= */

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: "admin" | "partner" | "employee";
  };

  admin?: {
    id: number;
    email: string;
    name: string;
    role: "admin";
  };

  partner?: {
    id: number;
    email: string;
    name: string;
    role: "partner";
  };

  employee?: {
    id: number;
    email: string;
    name: string;
    role: "employee";
  };
}

/* =========================================================
   ADMIN AUTH
========================================================= */

export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) throw new Error();

    const payload = verifyAdminToken(token) as AdminJWTPayload;

    req.admin = {
      id: Number(payload.id),
      email: payload.email,
      name: payload.name,
      role: "admin",
    };

    req.user = {
      userId: Number(payload.id),
      role: "admin",
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    } as ApiResponse<null>);
  }
};

/* =========================================================
   PARTNER AUTH
========================================================= */

export const authenticatePartner = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) throw new Error();

    const payload = verifyPartnerToken(token) as PartnerJWTPayload;

    req.partner = {
      id: Number(payload.id),
      email: payload.email,
      name: payload.name,
      role: "partner",
    };

    req.user = {
      userId: Number(payload.id),
      role: "partner",
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    } as ApiResponse<null>);
  }
};

/* =========================================================
   EMPLOYEE AUTH
========================================================= */

export const authenticateEmployee = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) throw new Error();

    const payload = verifyEmployeeToken(token) as EmployeeJWTPayload;

    req.employee = {
      id: Number(payload.id),
      email: payload.email,
      name: payload.name,
      role: "employee",
    };

    req.user = {
      userId: Number(payload.id),
      role: "employee",
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    } as ApiResponse<null>);
  }
};

/* =========================================================
   🔥 UNIVERSAL AUTH (ADMIN / PARTNER / EMPLOYEE)
========================================================= */

export const authenticateAny = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  
  const token = extractTokenFromHeader(req.headers.authorization);
 
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    let payload: any;

    try {
      payload = verifyAdminToken(token);
      req.admin = {
        id: Number(payload.id),
        email: payload.email,
        name: payload.name,
        role: "admin",
      };
      req.user = { userId: Number(payload.id), role: "admin" };
      return next();
    } catch {}

    try {
      payload = verifyPartnerToken(token);
      req.partner = {
        id: Number(payload.id),
        email: payload.email,
        name: payload.name,
        role: "partner",
      };
      req.user = { userId: Number(payload.id), role: "partner" };
      return next();
    } catch {}

    payload = verifyEmployeeToken(token);
    req.employee = {
      id: Number(payload.id),
      email: payload.email,
      name: payload.name,
      role: "employee",
    };
    req.user = { userId: Number(payload.id), role: "employee" };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/* =========================================================
   🔥 OPTIONAL AUTH (AUTHENTICATE IF TOKEN PRESENT, PROCEED IF ABSENT)
========================================================= */

export const authenticateOptional = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return next();
  }

  try {
    let payload: any;

    try {
      payload = verifyAdminToken(token);
      req.admin = {
        id: Number(payload.id),
        email: payload.email,
        name: payload.name,
        role: "admin",
      };
      req.user = { userId: Number(payload.id), role: "admin" };
      return next();
    } catch {}

    try {
      payload = verifyPartnerToken(token);
      req.partner = {
        id: Number(payload.id),
        email: payload.email,
        name: payload.name,
        role: "partner",
      };
      req.user = { userId: Number(payload.id), role: "partner" };
      return next();
    } catch {}

    payload = verifyEmployeeToken(token);
    req.employee = {
      id: Number(payload.id),
      email: payload.email,
      name: payload.name,
      role: "employee",
    };
    req.user = { userId: Number(payload.id), role: "employee" };

    return next();
  } catch {
    return next();
  }
};
