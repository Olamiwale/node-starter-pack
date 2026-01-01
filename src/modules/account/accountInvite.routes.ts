import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/requireRole.middleware";
import { AccountInviteController } from "./accountInvite.controller";

const router = Router();

// Invite a user (OWNER / ADMIN only)
router.post(
    "/invite", 
    authMiddleware, 
    requireRole(["OWNER", "ADMIN"]), 
    AccountInviteController.invite
);

// Accept an invite
router.post(
    "/invite/accept", 
    authMiddleware, 
    AccountInviteController.accept
);

export default router;
