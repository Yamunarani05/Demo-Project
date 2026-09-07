import { AppError } from '../middleware/errorHandler';

export function isEmail(val: any): boolean {
  if (typeof val !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

export function isPhone(val: any): boolean {
  if (!val) return true; // Optional in some schemas
  if (typeof val !== 'string') return false;
  const digits = val.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function validateRequired(obj: Record<string, any>, fields: string[]) {
  const missing: string[] = [];
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    throw new AppError(
      `Missing required fields: ${missing.join(', ')}`,
      422,
      'VALIDATION_ERROR',
      { missingFields: missing }
    );
  }
}

export function validateEmail(email: string) {
  if (!isEmail(email)) {
    throw new AppError('Invalid email address format', 422, 'INVALID_EMAIL');
  }
}

export function validatePassword(password: string) {
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 422, 'INVALID_PASSWORD');
  }
}

export function validateEnum(val: any, allowed: string[], fieldName: string) {
  if (val && !allowed.includes(val)) {
    throw new AppError(
      `Invalid value for '${fieldName}'. Allowed values: ${allowed.join(', ')}`,
      422,
      'INVALID_ENUM_VALUE',
      { allowed, received: val }
    );
  }
}
