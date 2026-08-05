import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as debtsService from "./debts.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await debtsService.listDebts(req.businessId!, req.query.direction as string, req.query.status as string));
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  res.json(await debtsService.getDebt(req.businessId!, req.params.id));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await debtsService.createDebt(req.businessId!, req.body));
});

export const pay = asyncHandler(async (req: Request, res: Response) => {
  res.json(await debtsService.recordPayment(req.businessId!, req.params.id, req.user!.id, req.body));
});
