import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildDateRange } from "../../utils/pagination";
import { z } from "zod";
import { createSaleSchema } from "./sales.schema";

interface ListParams {
  businessId: string;
  customerId?: string;
  from?: unknown;
  to?: unknown;
  skip: number;
  take: number;
}

export async function listSales(params: ListParams) {
  const where: Prisma.SaleWhereInput = {
    businessId: params.businessId,
    ...(params.customerId ? { customerId: params.customerId } : {}),
    ...(buildDateRange(params.from, params.to) ? { createdAt: buildDateRange(params.from, params.to) } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    }),
    prisma.sale.count({ where }),
  ]);

  return { items, total };
}

export async function getSale(businessId: string, id: string) {
  const sale = await prisma.sale.findFirst({
    where: { id, businessId },
    include: { customer: true, items: { include: { product: true } }, debt: true },
  });
  if (!sale) throw ApiError.notFound("Sale not found");
  return sale;
}

export async function createSale(businessId: string, userId: string, input: z.infer<typeof createSaleSchema>) {
  return prisma.$transaction(async (tx) => {
    const productIds = input.items.map((i) => i.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds }, businessId } });

    if (products.length !== new Set(productIds).size) {
      throw ApiError.badRequest("One or more products were not found");
    }

    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stockQty < item.quantity) {
        throw ApiError.badRequest(`Not enough stock for ${product.name} (available: ${product.stockQty})`);
      }
    }

    const subtotal = input.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const total = Math.max(0, subtotal - input.discount + input.vatAmount);

    if (input.amountPaid < total && !input.customerId) {
      throw ApiError.badRequest("A customer is required to record a partial or unpaid sale as a debt");
    }

    const paymentStatus = input.amountPaid >= total ? "PAID" : input.amountPaid > 0 ? "PARTIAL" : "UNPAID";

    const business = await tx.business.update({
      where: { id: businessId },
      data: { nextSaleNumber: { increment: 1 } },
    });
    const saleNumber = business.nextSaleNumber - 1;

    const sale = await tx.sale.create({
      data: {
        businessId,
        customerId: input.customerId ?? null,
        saleNumber,
        subtotal,
        discount: input.discount,
        vatAmount: input.vatAmount,
        total,
        amountPaid: input.amountPaid,
        paymentStatus,
        createdById: userId,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: { include: { product: true } }, customer: true },
    });

    for (const item of input.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.quantity } },
      });
    }

    if (input.amountPaid < total) {
      const balance = total - input.amountPaid;
      await tx.debt.create({
        data: {
          businessId,
          direction: "RECEIVABLE",
          customerId: input.customerId!,
          saleId: sale.id,
          originalAmount: total,
          balance,
          status: paymentStatus === "PARTIAL" ? "PARTIAL" : "UNPAID",
        },
      });
    }

    return sale;
  });
}
