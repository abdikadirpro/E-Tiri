import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPagination } from "../../utils/pagination";
import * as suppliersService from "./suppliers.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page, pageSize } = getPagination(req);
  const { items, total } = await suppliersService.listSuppliers(req.businessId!, req.query.search as string, skip, take);
  res.json({ items, total, page, pageSize });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  res.json(await suppliersService.getSupplier(req.businessId!, req.params.id));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await suppliersService.createSupplier(req.businessId!, req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await suppliersService.updateSupplier(req.businessId!, req.params.id, req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await suppliersService.deleteSupplier(req.businessId!, req.params.id);
  res.status(204).send();
});
