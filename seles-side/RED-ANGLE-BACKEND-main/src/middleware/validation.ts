import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

// Validation middleware factory
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // ✅ IMPORTANT: multipart/form-data safety
      const body = req.body ?? {};

      const parsed = schema.parse(body);

      // ✅ overwrite with parsed/coerced values
      req.body = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => issue.message);
        return res.status(400).json({
          success: false,
          message: errorMessages.join(", ") || "Validation error",
          errors: errorMessages,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal validation error",
      });
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.message,
        });
      }
      throw error;
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.message,
        });
      }
      throw error;
    }
  };
};
