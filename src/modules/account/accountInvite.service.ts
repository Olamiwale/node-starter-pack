import { prisma } from "../../config/database";
import { randomUUID } from "crypto";
import { AccountRole } from "./roles";

export class AccountInviteService {
  static async invite(accountId: string, email: string, role: AccountRole) {
    const token = randomUUID();

    return prisma.accountInvite.create({
      data: {
        accountId,
        email,
        role,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
      },
    });
  }

  static async acceptInvite(token: string, userId: string) {
    const invite = await prisma.accountInvite.findUnique({ where: { token } });

    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      throw Object.assign(new Error("Invalid invite"), { status: 400 });
    }

    await prisma.$transaction([
      prisma.accountMember.create({
        data: {
          accountId: invite.accountId,
          userId,
          role: invite.role,
        },
      }),
      prisma.accountInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);
  }
}
