import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPagination } from "../../utils/pagination";
import * as customersService from "./customers.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page, pageSize } = getPagination(req);
  const { items, total } = await customersService.listCustomers(req.businessId!, req.query.search as string, skip, take);
  res.json({ items, total, page, pageSize });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  res.json(await customersService.getCustomer(req.businessId!, req.params.id));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await customersService.createCustomer(req.businessId!, req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await customersService.updateCustomer(req.businessId!, req.params.id, req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await customersService.deleteCustomer(req.businessId!, req.params.id);
  res.status(204).send();
});
