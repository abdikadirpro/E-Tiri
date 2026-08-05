import { Router } from "express";
import * as expensesController from "./expenses.controller";
import { validateBody } from "../../middleware/validate.middleware";
import { createExpenseSchema, updateExpenseSchema } from "./expenses.schema";

const router = Router();

router.get("/", expensesController.list);
router.post("/", validateBody(createExpenseSchema), expensesController.create);
router.patch("/:id", validateBody(updateExpenseSchema), expensesController.update);
router.delete("/:id", expensesController.remove);

export default router;
