import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildDateRange } from "../../utils/pagination";
import { z } from "zod";
import { createIncomeSchema, updateIncomeSchema } from "./income.schema";

interface ListParams {
  businessId: string;
  search?: string;
  from?: unknown;
  to?: unknown;
  skip: number;
  take: number;
}

export async function listIncome(params: ListParams) {
  const where: Prisma.IncomeWhereInput = {
    businessId: params.businessId,
    ...(params.search ? { source: { contains: params.search, mode: "insensitive" } } : {}),
    ...(buildDateRange(params.from, params.to) ? { date: buildDateRange(params.from, params.to) } : {}),
  };

  const [items, total, sum] = await Promise.all([
    prisma.income.findMany({ where, orderBy: { date: "desc" }, skip: params.skip, take: params.take }),
    prisma.income.count({ where }),
    prisma.income.aggregate({ where, _sum: { amount: true } }),
  ]);

  return { items, total, totalAmount: Number(sum._sum.amount ?? 0) };
}

export function createIncome(businessId: string, userId: string, input: z.infer<typeof createIncomeSchema>) {
  return prisma.income.create({ data: { businessId, createdById: userId, ...input } });
}

export async function updateIncome(businessId: string, id: string, input: z.infer<typeof updateIncomeSchema>) {
  const income = await prisma.income.findFirst({ where: { id, businessId } });
  if (!income) throw ApiError.notFound("Income entry not found");
  return prisma.income.update({ where: { id }, data: input });
}

export async function deleteIncome(businessId: string, id: string) {
  const income = await prisma.income.findFirst({ where: { id, businessId } });
  if (!income) throw ApiError.notFound("Income entry not found");
  await prisma.income.delete({ where: { id } });
}
