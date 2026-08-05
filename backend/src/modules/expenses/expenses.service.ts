import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildDateRange } from "../../utils/pagination";
import { z } from "zod";
import { createExpenseSchema, updateExpenseSchema } from "./expenses.schema";

interface ListParams {
  businessId: string;
  search?: string;
  categoryId?: string;
  from?: unknown;
  to?: unknown;
  skip: number;
  take: number;
}

export async function listExpenses(params: ListParams) {
  const where: Prisma.ExpenseWhereInput = {
    businessId: params.businessId,
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.search ? { description: { contains: params.search, mode: "insensitive" } } : {}),
    ...(buildDateRange(params.from, params.to) ? { date: buildDateRange(params.from, params.to) } : {}),
  };

  const [items, total, sum] = await Promise.all([
    prisma.expense.findMany({ where, include: { category: true }, orderBy: { date: "desc" }, skip: params.skip, take: params.take }),
    prisma.expense.count({ where }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
  ]);

  return { items, total, totalAmount: Number(sum._sum.amount ?? 0) };
}

export function createExpense(businessId: string, userId: string, input: z.infer<typeof createExpenseSchema>) {
  return prisma.expense.create({ data: { businessId, createdById: userId, ...input } });
}

export async function updateExpense(businessId: string, id: string, input: z.infer<typeof updateExpenseSchema>) {
  const expense = await prisma.expense.findFirst({ where: { id, businessId } });
  if (!expense) throw ApiError.notFound("Expense entry not found");
  return prisma.expense.update({ where: { id }, data: input });
}

export async function deleteExpense(businessId: string, id: string) {
  const expense = await prisma.expense.findFirst({ where: { id, businessId } });
  if (!expense) throw ApiError.notFound("Expense entry not found");
  await prisma.expense.delete({ where: { id } });
}
