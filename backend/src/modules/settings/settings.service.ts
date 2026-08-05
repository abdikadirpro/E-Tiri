import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { comparePassword, hashPassword } from "../../lib/bcrypt";
import { z } from "zod";
import { updateBusinessSchema, updateProfileSchema } from "./settings.schema";

export function getBusiness(businessId: string) {
  return prisma.business.findUniqueOrThrow({ where: { id: businessId } });
}

export function updateBusiness(businessId: string, input: z.infer<typeof updateBusinessSchema>) {
  return prisma.business.update({ where: { id: businessId }, data: input });
}

export async function updateProfile(userId: string, input: z.infer<typeof updateProfileSchema>) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const data: { name?: string; passwordHash?: string } = {};
  if (input.name) data.name = input.name;

  if (input.newPassword) {
    if (!input.currentPassword) {
      throw ApiError.badRequest("Current password is required to set a new password");
    }
    const valid = await comparePassword(input.currentPassword, user.passwordHash);
    if (!valid) throw ApiError.unauthorized("Current password is incorrect");
    data.passwordHash = await hashPassword(input.newPassword);
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function exportBackup(businessId: string) {
  const [business, users, categories, products, customers, suppliers, incomes, expenses, sales, debts, payments] =
    await Promise.all([
      prisma.business.findUniqueOrThrow({ where: { id: businessId } }),
      prisma.user.findMany({ where: { businessId }, select: { id: true, name: true, email: true, role: true, isActive: true } }),
      prisma.category.findMany({ where: { businessId } }),
      prisma.product.findMany({ where: { businessId } }),
      prisma.customer.findMany({ where: { businessId } }),
      prisma.supplier.findMany({ where: { businessId } }),
      prisma.income.findMany({ where: { businessId } }),
      prisma.expense.findMany({ where: { businessId } }),
      prisma.sale.findMany({ where: { businessId }, include: { items: true } }),
      prisma.debt.findMany({ where: { businessId } }),
      prisma.payment.findMany({ where: { businessId } }),
    ]);

  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    business,
    users,
    categories,
    products,
    customers,
    suppliers,
    incomes,
    expenses,
    sales,
    debts,
    payments,
  };
}

interface RestorePayload {
  categories?: { name: string; type: string }[];
  products?: {
    name: string;
    barcode?: string | null;
    sellingPrice: number;
    costPrice: number;
    stockQty: number;
    lowStockThreshold: number;
    unit?: string | null;
  }[];
  customers?: { name: string; phone?: string | null; address?: string | null }[];
  suppliers?: { name: string; phone?: string | null; address?: string | null }[];
  incomes?: { source: string; amount: number; description?: string | null; date: string }[];
  expenses?: { amount: number; description?: string | null; date: string }[];
}

// Restores master data + ledger entries (categories, products, customers, suppliers, income, expenses)
// into the current business. Sales/debts/payments are intentionally excluded to avoid recreating
// financial records with broken product/customer references.
export async function restoreBackup(businessId: string, payload: RestorePayload) {
  return prisma.$transaction(async (tx) => {
    await tx.expense.deleteMany({ where: { businessId } });
    await tx.income.deleteMany({ where: { businessId } });
    await tx.product.deleteMany({ where: { businessId } });
    await tx.category.deleteMany({ where: { businessId } });
    await tx.customer.deleteMany({ where: { businessId } });
    await tx.supplier.deleteMany({ where: { businessId } });

    if (payload.categories?.length) {
      await tx.category.createMany({ data: payload.categories.map((c) => ({ businessId, name: c.name, type: c.type })) });
    }
    if (payload.customers?.length) {
      await tx.customer.createMany({ data: payload.customers.map((c) => ({ businessId, ...c })) });
    }
    if (payload.suppliers?.length) {
      await tx.supplier.createMany({ data: payload.suppliers.map((s) => ({ businessId, ...s })) });
    }
    if (payload.products?.length) {
      await tx.product.createMany({ data: payload.products.map((p) => ({ businessId, ...p })) });
    }
    if (payload.incomes?.length) {
      await tx.income.createMany({ data: payload.incomes.map((i) => ({ businessId, ...i, date: new Date(i.date) })) });
    }
    if (payload.expenses?.length) {
      await tx.expense.createMany({ data: payload.expenses.map((e) => ({ businessId, ...e, date: new Date(e.date) })) });
    }

    return { restored: true };
  });
}
