import { Router } from "express";
import * as debtsController from "./debts.controller";
import { validateBody } from "../../middleware/validate.middleware";
import { createDebtSchema, recordPaymentSchema } from "./debts.schema";

const router = Router();

router.get("/", debtsController.list);
router.get("/:id", debtsController.getOne);
router.post("/", validateBody(createDebtSchema), debtsController.create);
router.post("/:id/payments", validateBody(recordPaymentSchema), debtsController.pay);

export default router;
