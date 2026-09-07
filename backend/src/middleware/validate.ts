import { Request, Response, NextFunction } from 'express';
import { validateRequired } from '../validations';

export function requireBodyFields(...fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      validateRequired(req.body, fields);
      next();
    } catch (err) {
      next(err);
    }
  };
}
