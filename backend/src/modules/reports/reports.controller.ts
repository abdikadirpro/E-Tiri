import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { prisma } from "../../lib/prisma";
import * as reportsService from "./reports.service";
import * as analyticsService from "./analytics.service";
import { streamExcel } from "./excel.export";
import { streamReportPdf } from "./pdf.export";
import { ApiError } from "../../utils/ApiError";

function parseType(req: Request): reportsService.ReportType {
  const type = req.query.type as string;
  const valid: reportsService.ReportType[] = ["income", "expenses", "profit-loss", "sales", "inventory"];
  if (!valid.includes(type as reportsService.ReportType)) {
    throw ApiError.badRequest("Invalid report type");
  }
  return type as reportsService.ReportType;
}

export const getReport = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportsService.getReportData(req.businessId!, parseType(req), req.query.from, req.query.to);
  res.json(data);
});

export const exportExcel = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportsService.getReportData(req.businessId!, parseType(req), req.query.from, req.query.to);
  await streamExcel(res, data);
});

export const exportPdf = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportsService.getReportData(req.businessId!, parseType(req), req.query.from, req.query.to);
  const business = await prisma.business.findUniqueOrThrow({ where: { id: req.businessId! } });
  streamReportPdf(res, data, business.name);
});

export const topProducts = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  res.json(await analyticsService.getTopProducts(req.businessId!, req.query.from, req.query.to, limit));
});

export const topCustomers = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  res.json(await analyticsService.getTopCustomers(req.businessId!, req.query.from, req.query.to, limit));
});

export const cashFlow = asyncHandler(async (req: Request, res: Response) => {
  res.json(await analyticsService.getCashFlow(req.businessId!, req.query.from, req.query.to));
});

export const monthlyComparison = asyncHandler(async (req: Request, res: Response) => {
  res.json(await analyticsService.getMonthlyComparison(req.businessId!));
});
