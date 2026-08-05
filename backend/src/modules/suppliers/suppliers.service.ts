import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { z } from "zod";
import { createSupplierSchema, updateSupplierSchema } from "./suppliers.schema";

export async function listSuppliers(businessId: string, search?: string, skip = 0, take = 20) {
  const where: Prisma.SupplierWhereInput = {
    businessId,
    ...(search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { phone: { contains: search, mode: "insensitive" } }] }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.supplier.findMany({ where, orderBy: { name: "asc" }, skip, take }),
    prisma.supplier.count({ where }),
  ]);
  return { items, total };
}

export function createSupplier(businessId: string, input: z.infer<typeof createSupplierSchema>) {
  return prisma.supplier.create({ data: { businessId, ...input } });
}

export async function getSupplier(businessId: string, id: string) {
  const supplier = await prisma.supplier.findFirst({ where: { id, businessId } });
  if (!supplier) throw ApiError.notFound("Supplier not found");

  const debts = await prisma.debt.findMany({
    where: { supplierId: id, businessId },
    include: { payments: true },
    orderBy: { createdAt: "desc" },
  });

  const owedBalance = debts.reduce((sum, d) => sum + Number(d.balance), 0);

  return { supplier, debts, owedBalance };
}

export async function updateSupplier(businessId: string, id: string, input: z.infer<typeof updateSupplierSchema>) {
  const supplier = await prisma.supplier.findFirst({ where: { id, businessId } });
  if (!supplier) throw ApiError.notFound("Supplier not found");
  return prisma.supplier.update({ where: { id }, data: input });
}

export async function deleteSupplier(businessId: string, id: string) {
  const supplier = await prisma.supplier.findFirst({ where: { id, businessId } });
  if (!supplier) throw ApiError.notFound("Supplier not found");
  await prisma.supplier.delete({ where: { id } });
}
