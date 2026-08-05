import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as categoriesService from "./categories.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await categoriesService.listCategories(req.businessId!, req.query.type as string | undefined));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await categoriesService.createCategory(req.businessId!, req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await categoriesService.updateCategory(req.businessId!, req.params.id, req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoriesService.deleteCategory(req.businessId!, req.params.id);
  res.status(204).send();
});
