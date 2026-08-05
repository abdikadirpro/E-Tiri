import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPagination } from "../../utils/pagination";
import * as productsService from "./products.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page, pageSize } = getPagination(req);
  const { items, total } = await productsService.listProducts({
    businessId: req.businessId!,
    search: req.query.search as string | undefined,
    categoryId: req.query.categoryId as string | undefined,
    lowStock: req.query.lowStock === "true",
    skip,
    take,
  });
  res.json({ items, total, page, pageSize });
});

export const getByBarcode = asyncHandler(async (req: Request, res: Response) => {
  res.json(await productsService.getProductByBarcode(req.businessId!, req.params.code));
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  res.json(await productsService.getProduct(req.businessId!, req.params.id));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await productsService.createProduct(req.businessId!, req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await productsService.updateProduct(req.businessId!, req.params.id, req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await productsService.deleteProduct(req.businessId!, req.params.id);
  res.status(204).send();
});

export const stockIn = asyncHandler(async (req: Request, res: Response) => {
  res.json(await productsService.stockIn(req.businessId!, req.params.id, req.user!.id, req.body));
});

export const stockOut = asyncHandler(async (req: Request, res: Response) => {
  res.json(await productsService.stockOut(req.businessId!, req.params.id, req.user!.id, req.body));
});

export const stockAdjustment = asyncHandler(async (req: Request, res: Response) => {
  res.json(await productsService.stockAdjustment(req.businessId!, req.params.id, req.user!.id, req.body));
});

export const lowStock = asyncHandler(async (req: Request, res: Response) => {
  res.json(await productsService.listLowStock(req.businessId!));
});

export const movements = asyncHandler(async (req: Request, res: Response) => {
  res.json(await productsService.listStockMovements(req.businessId!, req.params.id));
});
