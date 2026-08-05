import { Router } from "express";
import * as productsController from "./products.controller";
import { requireRole } from "../../middleware/role.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import { createProductSchema, stockAdjustSchema, stockMoveSchema, updateProductSchema } from "./products.schema";

const router = Router();

router.get("/", productsController.list);
router.get("/low-stock", productsController.lowStock);
router.get("/barcode/:code", productsController.getByBarcode);
router.get("/:id", productsController.getOne);
router.get("/:id/movements", productsController.movements);
router.post("/", requireRole("OWNER", "ADMIN"), validateBody(createProductSchema), productsController.create);
router.patch("/:id", requireRole("OWNER", "ADMIN"), validateBody(updateProductSchema), productsController.update);
router.delete("/:id", requireRole("OWNER", "ADMIN"), productsController.remove);
router.post("/:id/stock-in", validateBody(stockMoveSchema), productsController.stockIn);
router.post("/:id/stock-out", validateBody(stockMoveSchema), productsController.stockOut);
router.post("/:id/stock-adjustment", requireRole("OWNER", "ADMIN"), validateBody(stockAdjustSchema), productsController.stockAdjustment);

export default router;
