import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
  studio_id?: string;
  client_id?: string;
  photographer_id?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Middleware: Verify JWT Access Token
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next(new AppError('Authentication required. Missing token.', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN'));
  }
}

/**
 * Middleware: Optional Authentication (attaches req.user if token is present)
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
      req.user = decoded;
    } catch {
      // Ignore token errors for optional auth
    }
  }
  next();
}

/**
 * Middleware: Role-Based Authorization Guard
 */
export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized. Login required.', 401, 'UNAUTHORIZED'));
    }

    // Great Master has platform-wide superadmin privilege
    if (req.user.role === 'great_master' || req.user.role === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden. Role '${req.user.role}' does not have access to this resource.`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}
