import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200,
  extra: Record<string, any> = {}
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Data fetched successfully'
): Response {
  const totalPages = Math.ceil(total / limit) || 1;
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    total,
  });
}

export function sendError(
  res: Response,
  message: string,
  errorCode = 'INTERNAL_ERROR',
  statusCode = 500,
  details?: any
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
    ...(details ? { details } : {}),
  });
}
