import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { registerSchema, loginSchema,  refreshSchema } from "./auth.schema";
import { rateLimitMiddleware } from "../../middlewares/rateLimit";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", rateLimitMiddleware, validate(loginSchema), AuthController.login);
router.post("/refresh", validate(refreshSchema), AuthController.refresh);
router.post("/logout", validate(refreshSchema), AuthController.logout);


router.get("/verify-account", AuthController.verifyAccount);

export default router;
