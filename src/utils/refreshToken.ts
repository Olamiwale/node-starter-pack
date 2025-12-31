import crypto from "crypto";
import { prisma } from "../config/database";

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function saveRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date
) {
  return prisma.refreshToken.create({
    data: {
      userId,
      token: hashToken(token),
      expiresAt,
    },
  });
}

export async function findRefreshToken(token: string) {
  return prisma.refreshToken.findUnique({
    where: {
      token: hashToken(token),
    },
  });
}

export async function deleteRefreshToken(token: string) {
  return prisma.refreshToken.delete({
    where: {
      token: hashToken(token),
    },
  });
}
