import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;

  constructor(message: string, statusCode = 400, errorCode = 'BAD_REQUEST', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  console.error(`[ERROR HANDLER] ${req.method} ${req.originalUrl}:`, err?.message || err);

  // Custom AppError
  if (err instanceof AppError) {
    return sendError(res, err.message, err.errorCode, err.statusCode, err.details);
  }

  // PostgreSQL Duplicate Key (Code 23505)
  if (err?.code === '23505') {
    const detail = err.detail || 'Unique constraint violation';
    return sendError(res, detail, 'DUPLICATE_RESOURCE', 409);
  }

  // PostgreSQL Foreign Key Violation (Code 23503)
  if (err?.code === '23503') {
    const detail = err.detail || 'Referenced record not found';
    return sendError(res, detail, 'FOREIGN_KEY_VIOLATION', 422);
  }

  // JWT Errors
  if (err?.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token', 'UNAUTHORIZED', 401);
  }
  if (err?.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token expired', 'TOKEN_EXPIRED', 401);
  }

  // Fallback 500 Internal Server Error
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : (err?.message || 'Server error');
  return sendError(res, message, 'INTERNAL_SERVER_ERROR', 500);
}
