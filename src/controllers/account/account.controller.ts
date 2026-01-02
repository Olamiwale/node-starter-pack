import { Request, Response } from "express";
import { AccountService } from "../../services/account/account.service";

export class AccountController {
  static async invite(req: Request, res: Response) {
    try {
      await AccountService.inviteMember(
        req.user!.accountId,
        req.body.email,
        req.body.role
      );
      res.status(204).send();
    } catch (e: any) {
      if (e.message === "409_MEMBER_EXISTS" || e.message === "409_INVITE_EXISTS")
        return res.status(409).json({ message: "Duplicate invite/member" });
      res.status(400).json({ message: "Invite failed" });
    }
  }
}
