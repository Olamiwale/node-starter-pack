import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { UserService } from "./user.service";

export class UserController {
  static async getMe(req: AuthRequest, res: Response) {
    const user = await UserService.getById(req.user!.id);
    res.json({ success: true, data: user });
  }

  static async updateMe(req: AuthRequest, res: Response) {
    const user = await UserService.updateMe(req.user!.id, req.body.name);
    res.json({ success: true, data: user });
  }

  // ADMIN
  static async getAllUsers(_req: AuthRequest, res: Response) {
    const users = await UserService.getAll();
    res.json({ success: true, data: users });
  }

  static async updateUserRole(req: AuthRequest, res: Response) {
    const user = await UserService.updateRole(
      req.params.id,
      req.body.role
    );
    res.json({ success: true, data: user });
  }
}
