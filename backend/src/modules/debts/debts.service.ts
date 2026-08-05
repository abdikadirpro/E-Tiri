import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { z } from "zod";
import { createDebtSchema, recordPaymentSchema } from "./debts.schema";

export async function listDebts(businessId: string, direction?: string, status?: string) {
  const where: Prisma.DebtWhereInput = {
    businessId,
    ...(direction ? { direction: direction as "RECEIVABLE" | "PAYABLE" } : {}),
    ...(status ? { status: status as "PAID" | "PARTIAL" | "UNPAID" } : {}),
  };
  return prisma.debt.findMany({
    where,
    include: { customer: true, supplier: true, payments: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDebt(businessId: string, id: string) {
  const debt = await prisma.debt.findFirst({
    where: { id, businessId },
    include: { customer: true, supplier: true, payments: { orderBy: { paidAt: "desc" } }, sale: true },
  });
  if (!debt) throw ApiError.notFound("Debt not found");
  return debt;
}

export async function createDebt(businessId: string, input: z.infer<typeof createDebtSchema>) {
  if (input.direction === "RECEIVABLE" && !input.customerId) {
    throw ApiError.badRequest("customerId is required for a receivable debt");
  }
  if (input.direction === "PAYABLE" && !input.supplierId) {
    throw ApiError.badRequest("supplierId is required for a payable debt");
  }

  return prisma.debt.create({
    data: {
      businessId,
      direction: input.direction,
      customerId: input.direction === "RECEIVABLE" ? input.customerId : null,
      supplierId: input.direction === "PAYABLE" ? input.supplierId : null,
      originalAmount: input.originalAmount,
      balance: input.originalAmount,
      dueDate: input.dueDate ?? null,
      notes: input.notes,
      status: "UNPAID",
    },
  });
}

export async function recordPayment(businessId: string, debtId: string, userId: string, input: z.infer<typeof recordPaymentSchema>) {
  return prisma.$transaction(async (tx) => {
    const debt = await tx.debt.findFirst({ where: { id: debtId, businessId } });
    if (!debt) throw ApiError.notFound("Debt not found");

    const currentBalance = Number(debt.balance);
    if (input.amount > currentBalance) {
      throw ApiError.badRequest(`Payment amount exceeds remaining balance (${currentBalance})`);
    }

    const newBalance = currentBalance - input.amount;
    const status = newBalance <= 0 ? "PAID" : "PARTIAL";

    await tx.payment.create({
      data: {
        businessId,
        debtId,
        amount: input.amount,
        note: input.note,
        paidAt: input.paidAt ?? new Date(),
        createdById: userId,
      },
    });

    return tx.debt.update({
      where: { id: debtId },
      data: { balance: newBalance, status },
      include: { payments: true, customer: true, supplier: true },
    });
  });
}
