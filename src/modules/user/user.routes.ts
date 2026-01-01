import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/requireRole.middleware";
import { UserController } from "./user.controller";


const router = Router();


// USER routes
router.get("/me", authMiddleware, UserController.getMe);
router.put("/me", authMiddleware, UserController.updateMe);



router.get("/", authMiddleware, requireRole(["ADMIN"]), UserController.getAllUsers);
router.patch(
  "/:id/role",
  authMiddleware,
  requireRole(["ADMIN"]),
  UserController.updateUserRole
);

export default router;


