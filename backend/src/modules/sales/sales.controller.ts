import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPagination } from "../../utils/pagination";
import { prisma } from "../../lib/prisma";
import * as salesService from "./sales.service";
import { streamReceipt } from "./receipt.pdf";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page, pageSize } = getPagination(req);
  const { items, total } = await salesService.listSales({
    businessId: req.businessId!,
    customerId: req.query.customerId as string,
    from: req.query.from,
    to: req.query.to,
    skip,
    take,
  });
  res.json({ items, total, page, pageSize });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  res.json(await salesService.getSale(req.businessId!, req.params.id));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await salesService.createSale(req.businessId!, req.user!.id, req.body));
});

export const receipt = asyncHandler(async (req: Request, res: Response) => {
  const sale = await salesService.getSale(req.businessId!, req.params.id);
  const business = await prisma.business.findUniqueOrThrow({ where: { id: req.businessId! } });
  streamReceipt(res, business, sale);
});
