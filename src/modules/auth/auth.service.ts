import { prisma } from "../../config/database";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";
import {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
} from "../../utils/refreshToken";
import { randomUUID } from "crypto";

export class AuthService {

  static async register(email: string, password: string, name?: string) {
    const hashed = await hashPassword(password);

    return prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: { name: name || "My Workspace"},
      });

      
      const user = await tx.user.create({
        data: { email, password: hashed, name,  role: "USER"},
      });

      await tx.accountMember.create({
        data: { accountId: account.id,  userId: user.id, role: "OWNER"},
      });

      const token = randomUUID();
      await tx.accountVerificationToken.create({
        data: {
          accountId: account.id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      return { user, account, verificationToken: token };
    });


  }


  static async verifyAccount(token: string) {
  const record = await prisma.accountVerificationToken.findUnique({
    where: { token },
    include: { account: true },
  });

  if (!record) {
    throw new Error("Invalid verification token");
  }

  if (record.expiresAt < new Date()) {
    throw new Error("Verification token expired");
  }

  await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: record.accountId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    await tx.accountVerificationToken.delete({
      where: { id: record.id },
    });
  });

  return { success: true };
}


// ===============================Login===================================

  
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    } 

    const passwordValid = await comparePassword(password, user.password);
    if (!passwordValid) throw new Error("Invalid credentials");

    // Get active account membership (first one for now)
    const membership = await prisma.accountMember.findFirst({
      where: { userId: user.id },
      include: { account: true },
    });


    if (!membership) {
      throw new Error("User is not associated with any account");
    }

    if(!membership.account.isVerified) {
      const error = new Error("Account is not verified") as Error & {statusCode?: number};
      error.statusCode = 403;
      throw error;
    }


    const accessToken = signAccessToken({
      id: user.id,
      accountId: membership.accountId,
      role: membership.role,
    });

    const refreshToken = signRefreshToken({
      id: user.id,
      accountId: membership.accountId,
      role: membership.role,
    });

    return { user, accessToken, refreshToken };
  }




  // ===============================Refresh tokens===================================
  
  static async refresh(refreshToken: string) {
    const stored = await findRefreshToken(refreshToken);
    if (!stored) throw new Error("Invalid refresh token");

    await deleteRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: stored.userId },
    });

    if (!user) throw new Error("User not found");

    const membership = await prisma.accountMember.findFirst({
      where: { userId: user.id },
      include: { account: true },
    });

    if (!membership) {
      throw new Error("User has no active account");
    }

    
    if (!membership.account.isVerified) {
      const error = new Error("Account is not verified") as Error & {statusCode?: number};
      error.statusCode = 403;
      throw error;
    }

    const accessToken = signAccessToken({
      id: user.id,
      accountId: membership.accountId,
      role: membership.role,
    });

    const newRefreshToken = signRefreshToken({
      id: user.id,
      accountId: membership.accountId,
      role: membership.role,
    });

    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    await saveRefreshToken(user.id, newRefreshToken, expires);

    return { accessToken, refreshToken: newRefreshToken };
  }


  static async logout(refreshToken: string) {
    await deleteRefreshToken(refreshToken);
  }
}
