import { Router } from "express";
import * as adminController from "./admin.controller";
import { validateBody } from "../../middleware/validate.middleware";
import { createBusinessSchema } from "./admin.schema";

const router = Router();

router.post("/businesses", validateBody(createBusinessSchema), adminController.createBusiness);

export default router;
