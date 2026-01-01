import { Request, Response } from "express";
import { AccountInviteService } from "./accountInvite.service";
import { AccountRole } from "./roles";

export class AccountInviteController {
  static async invite(req: Request, res: Response) {
    const { email, role } = req.body;
    const accountId = req.user!.accountId;

    if (!email || !role || !(role in AccountRole)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const invite = await AccountInviteService.invite(accountId, email, role as AccountRole);
    // TODO: send email with invite.token

    res.status(201).json({ message: "Invite created", token: invite.token });
  }

  static async accept(req: Request, res: Response) {
    const { token } = req.body;
    const userId = req.user!.id;

    try {
      await AccountInviteService.acceptInvite(token, userId);
      res.json({ message: "Invite accepted" });
    } catch (err: any) {
      res.status(err.status || 400).json({ message: err.message });
    }
  }
}
