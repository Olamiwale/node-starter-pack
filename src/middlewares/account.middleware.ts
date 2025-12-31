import { AuthRequest } from "./auth.middleware";
import { Response, NextFunction } from "express";

export function requireAccount(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  if (!req.user?.accountId) {
    throw new Error("Account required");
  }
  next();
}
