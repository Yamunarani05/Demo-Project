// src/utils/getUserIdFromRequest.ts
import {AuthenticatedRequest  } from "../middleware/auth";

export function getUserIdFromRequest(
  req: AuthenticatedRequest
): number | null {
  const user: any = (req as any).user;

  if (!user?.userId) return null;

  const userId = Number(user.id);
  return Number.isNaN(userId) ? null : userId;
}
