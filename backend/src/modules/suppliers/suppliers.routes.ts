import { Router } from "express";
import * as suppliersController from "./suppliers.controller";
import { requireRole } from "../../middleware/role.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { createSupplierSchema, updateSupplierSchema } from "./suppliers.schema";

const router = Router();

router.get("/", suppliersController.list);
router.get("/:id", suppliersController.getOne);
router.post("/", requireRole("OWNER", "ADMIN"), validateBody(createSupplierSchema), suppliersController.create);
router.patch("/:id", requireRole("OWNER", "ADMIN"), validateBody(updateSupplierSchema), suppliersController.update);
router.delete("/:id", requireRole("OWNER", "ADMIN"), suppliersController.remove);

export default router;
