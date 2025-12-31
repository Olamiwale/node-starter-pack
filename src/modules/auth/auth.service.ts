import { prisma } from "../../config/database";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccessToken, signRefreshToken,} from "../../utils/jwt";
import { saveRefreshToken, findRefreshToken, deleteRefreshToken, } from "../../utils/refreshToken";

export class AuthService {

  static async register(email: string, password: string, name?: string) {
  const hashed = await hashPassword(password);

  return prisma.$transaction(async (tx) => {
    const account = await tx.account.create({
      data: { name: name || "My Workspace" },
    });

    const user = await tx.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: "ADMIN",
        accountId: account.id,
      },
    });

    return user;
  });
}



  static async login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = signAccessToken({
    id: user.id,
    role: user.role,
    accountId: user.accountId,
  });

  const refreshToken = signRefreshToken({
    id: user.id,
    role: user.role,
    accountId: user.accountId,
  });

  return { accessToken, refreshToken };
}






  static async refresh(refreshToken: string) {
    const stored = await findRefreshToken(refreshToken);
    if (!stored) throw new Error("Invalid refresh token");

    await deleteRefreshToken(refreshToken);

    // fetch user to get role
    const user = await prisma.user.findUnique({
      where: { id: stored.userId },
      select: { id: true, role: true },
    });

    if (!user) throw new Error("User not found");

    const accessToken = signAccessToken({
      id: user.id,
      role: user.role,
      accountId: user.accountId,
    });

    const newRefreshToken = signRefreshToken({
      id: user.id,
      role: user.role,
      accountId: user.accountId,
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
