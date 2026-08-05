import { Router } from "express";
import * as authController from "./auth.controller";
import { validateBody } from "../../middleware/validate.middleware";
import { loginSchema } from "./auth.schema";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/login", validateBody(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.me);

export default router;
