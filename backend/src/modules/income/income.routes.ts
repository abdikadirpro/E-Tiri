import { Router } from "express";
import * as incomeController from "./income.controller";
import { validateBody } from "../../middleware/validate.middleware";
import { createIncomeSchema, updateIncomeSchema } from "./income.schema";

const router = Router();

router.get("/", incomeController.list);
router.post("/", validateBody(createIncomeSchema), incomeController.create);
router.patch("/:id", validateBody(updateIncomeSchema), incomeController.update);
router.delete("/:id", incomeController.remove);

export default router;
