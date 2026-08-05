import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as settingsService from "./settings.service";

export const getBusiness = asyncHandler(async (req: Request, res: Response) => {
  res.json(await settingsService.getBusiness(req.businessId!));
});

export const updateBusiness = asyncHandler(async (req: Request, res: Response) => {
  res.json(await settingsService.updateBusiness(req.businessId!, req.body));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  res.json(await settingsService.updateProfile(req.user!.id, req.body));
});

export const backup = asyncHandler(async (req: Request, res: Response) => {
  const data = await settingsService.exportBackup(req.businessId!);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="e-tiri-backup-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json(data);
});

export const restore = asyncHandler(async (req: Request, res: Response) => {
  res.json(await settingsService.restoreBackup(req.businessId!, req.body));
});
