import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";
import { prisma } from "../config/database";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token);

    const account = await prisma.account.findUnique({
      where: { id: payload.accountId },
    });

    if (!account) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!account.isVerified) {
      return res.status(403).json({ message: "Account not verified" });
    }

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
