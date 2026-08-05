import { Router } from "express";
import * as dashboardController from "./dashboard.controller";

const router = Router();

router.get("/summary", dashboardController.summary);
router.get("/low-stock", dashboardController.lowStock);

export default router;
