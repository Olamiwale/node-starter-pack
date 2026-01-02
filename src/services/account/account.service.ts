import { prisma } from '../../config/database';
import { EmailService } from '../email/email.service';
import { randomUUID } from 'crypto';



export class AccountService {
  static async invite(accountId: string, email: string, role: AccountRole) {
  // Check if user is already a member
  const existingMember = await prisma.accountMember.findFirst({
    where: {
      accountId,
      user: { email },
    },
  });
  if (existingMember) {
    throw Object.assign(new Error("User is already a member of this account"), {
      status: 409,
    });
  }

  // Check if there is already an active invite for this email
  const existingInvite = await prisma.accountInvite.findFirst({
    where: {
      accountId,
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (existingInvite) {
    throw Object.assign(new Error("An active invite already exists for this email"), {
      status: 409,
    });
  }

  const token = randomUUID();

  return prisma.accountInvite.create({
    data: {
      accountId,
      email,
      role,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });
}


  static async acceptInvite(token: string, userId: string) {
  // Cleanup expired invites first
  await prisma.accountInvite.deleteMany({
    where: { expiresAt: { lt: new Date() }, acceptedAt: null },
  });

  const invite = await prisma.accountInvite.findUnique({ where: { token } });

  if (!invite || invite.acceptedAt) {
    throw Object.assign(new Error("Invalid invite"), { status: 400 });
  }

  if (invite.expiresAt < new Date()) {
    throw Object.assign(new Error("Invite expired"), { status: 400 });
  }

  // Check if user is already a member
  const alreadyMember = await prisma.accountMember.findFirst({
    where: { accountId: invite.accountId, userId },
  });
  if (alreadyMember) {
    throw Object.assign(new Error("User is already a member of this account"), {
      status: 409,
    });
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
