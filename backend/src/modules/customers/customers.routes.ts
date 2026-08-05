import { Router } from "express";
import * as customersController from "./customers.controller";
import { requireRole } from "../../middleware/role.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { createCustomerSchema, updateCustomerSchema } from "./customers.schema";

const router = Router();

router.get("/", customersController.list);
router.get("/:id", customersController.getOne);
router.post("/", validateBody(createCustomerSchema), customersController.create);
router.patch("/:id", requireRole("OWNER", "ADMIN"), validateBody(updateCustomerSchema), customersController.update);
router.delete("/:id", requireRole("OWNER", "ADMIN"), customersController.remove);

export default router;
