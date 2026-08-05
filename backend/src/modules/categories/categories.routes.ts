import { Router } from "express";
import * as categoriesController from "./categories.controller";
import { requireRole } from "../../middleware/role.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { createCategorySchema, updateCategorySchema } from "./categories.schema";

const router = Router();

router.get("/", categoriesController.list);
router.post("/", requireRole("OWNER", "ADMIN"), validateBody(createCategorySchema), categoriesController.create);
router.patch("/:id", requireRole("OWNER", "ADMIN"), validateBody(updateCategorySchema), categoriesController.update);
router.delete("/:id", requireRole("OWNER", "ADMIN"), categoriesController.remove);

export default router;
