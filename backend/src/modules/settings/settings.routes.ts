import { Router } from "express";
import * as settingsController from "./settings.controller";
import { requireRole } from "../../middleware/role.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { updateBusinessSchema, updateProfileSchema } from "./settings.schema";

const router = Router();

router.get("/business", settingsController.getBusiness);
router.patch("/business", requireRole("OWNER", "ADMIN"), validateBody(updateBusinessSchema), settingsController.updateBusiness);
router.patch("/profile", validateBody(updateProfileSchema), settingsController.updateProfile);
router.get("/backup", requireRole("OWNER"), settingsController.backup);
router.post("/restore", requireRole("OWNER"), settingsController.restore);

export default router;
