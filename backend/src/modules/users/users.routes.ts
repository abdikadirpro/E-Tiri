import { Router } from "express";
import * as usersController from "./users.controller";
import { requireRole } from "../../middleware/role.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { createUserSchema, updateUserSchema } from "./users.schema";

const router = Router();

router.get("/", requireRole("OWNER", "ADMIN"), usersController.list);
router.post("/", requireRole("OWNER", "ADMIN"), validateBody(createUserSchema), usersController.create);
router.patch("/:id", requireRole("OWNER", "ADMIN"), validateBody(updateUserSchema), usersController.update);
router.delete("/:id", requireRole("OWNER"), usersController.remove);

export default router;
