import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { z } from "zod";
import { createCustomerSchema, updateCustomerSchema } from "./customers.schema";

export async function listCustomers(businessId: string, search?: string, skip = 0, take = 20) {
  const where: Prisma.CustomerWhereInput = {
    businessId,
    ...(search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { phone: { contains: search, mode: "insensitive" } }] }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.customer.findMany({ where, orderBy: { name: "asc" }, skip, take }),
    prisma.customer.count({ where }),
  ]);
  return { items, total };
}

export function createCustomer(businessId: string, input: z.infer<typeof createCustomerSchema>) {
  return prisma.customer.create({ data: { businessId, ...input } });
}

export async function getCustomer(businessId: string, id: string) {
  const customer = await prisma.customer.findFirst({ where: { id, businessId } });
  if (!customer) throw ApiError.notFound("Customer not found");

  const [sales, debts] = await Promise.all([
    prisma.sale.findMany({
      where: { customerId: id, businessId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.debt.findMany({
      where: { customerId: id, businessId },
      include: { payments: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const debtBalance = debts.reduce((sum, d) => sum + Number(d.balance), 0);

  return { customer, sales, debts, debtBalance };
}

export async function updateCustomer(businessId: string, id: string, input: z.infer<typeof updateCustomerSchema>) {
  const customer = await prisma.customer.findFirst({ where: { id, businessId } });
  if (!customer) throw ApiError.notFound("Customer not found");
  return prisma.customer.update({ where: { id }, data: input });
}

export async function deleteCustomer(businessId: string, id: string) {
  const customer = await prisma.customer.findFirst({ where: { id, businessId } });
  if (!customer) throw ApiError.notFound("Customer not found");
  await prisma.customer.delete({ where: { id } });
}
