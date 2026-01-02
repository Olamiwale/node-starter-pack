import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { AccountInviteService } from "./accountInvite.service";
import { AccountRole } from "./roles";
import { EmailService } from "../../services/email/email.service";
import { accountInviteTemplate } from "../../services/email/templates/accountInviteTemplate";

export class AccountInviteController {
  static async invite(req: AuthRequest, res: Response) {
    const { email, role } = req.body;
    const accountId = req.user!.accountId;

    if (!email || !role || !(role in AccountRole)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const invite = await AccountInviteService.invite(
      accountId,
      email,
      role as AccountRole
    );

    const inviteUrl = `${process.env.APP_URL}/accounts/invite/accept?token=${invite.token}`;

    await EmailService.send(
      email,
      "You're invited to join an account",
      accountInviteTemplate(inviteUrl)
    );

    return res.status(201).json({ message: "Invite sent successfully" });
  }

  static async accept(req: AuthRequest, res: Response) {
    const { token } = req.body;
    const userId = req.user!.id;

    await AccountInviteService.acceptInvite(token, userId);
    res.json({ message: "Invite accepted" });
  }
}
