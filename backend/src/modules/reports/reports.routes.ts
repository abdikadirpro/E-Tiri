import { Router } from "express";
import * as reportsController from "./reports.controller";

const router = Router();

router.get("/", reportsController.getReport);
router.get("/export/excel", reportsController.exportExcel);
router.get("/export/pdf", reportsController.exportPdf);
router.get("/analytics/top-products", reportsController.topProducts);
router.get("/analytics/top-customers", reportsController.topCustomers);
router.get("/analytics/cash-flow", reportsController.cashFlow);
router.get("/analytics/monthly-comparison", reportsController.monthlyComparison);

export default router;
