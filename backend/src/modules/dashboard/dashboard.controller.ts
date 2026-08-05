import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as dashboardService from "./dashboard.service";

export const summary = asyncHandler(async (req: Request, res: Response) => {
  res.json(await dashboardService.getSummary(req.businessId!, req.query.from, req.query.to));
});

export const lowStock = asyncHandler(async (req: Request, res: Response) => {
  res.json(await dashboardService.getLowStockProducts(req.businessId!));
});
