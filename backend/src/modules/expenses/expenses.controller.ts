import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPagination } from "../../utils/pagination";
import * as expensesService from "./expenses.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page, pageSize } = getPagination(req);
  const { items, total, totalAmount } = await expensesService.listExpenses({
    businessId: req.businessId!,
    search: req.query.search as string,
    categoryId: req.query.categoryId as string,
    from: req.query.from,
    to: req.query.to,
    skip,
    take,
  });
  res.json({ items, total, totalAmount, page, pageSize });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await expensesService.createExpense(req.businessId!, req.user!.id, req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await expensesService.updateExpense(req.businessId!, req.params.id, req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await expensesService.deleteExpense(req.businessId!, req.params.id);
  res.status(204).send();
});
