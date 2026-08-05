import { Router } from "express";
import * as salesController from "./sales.controller";
import { validateBody } from "../../middleware/validate.middleware";
import { createSaleSchema } from "./sales.schema";

const router = Router();

router.get("/", salesController.list);
router.get("/:id", salesController.getOne);
router.get("/:id/receipt", salesController.receipt);
router.post("/", validateBody(createSaleSchema), salesController.create);

export default router;
