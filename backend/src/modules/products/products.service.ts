import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { getPagination } from "../../utils/pagination";
import { z } from "zod";
import { createProductSchema, stockAdjustSchema, stockMoveSchema, updateProductSchema } from "./products.schema";

interface ListParams {
  businessId: string;
  search?: string;
  categoryId?: string;
  lowStock?: boolean;
  skip: number;
  take: number;
}

export async function listProducts(params: ListParams) {
  const where: Prisma.ProductWhereInput = {
    businessId: params.businessId,
    isActive: true,
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" } },
            { barcode: { contains: params.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
      skip: params.skip,
      take: params.take,
    }),
    prisma.product.count({ where }),
  ]);

  const filtered = params.lowStock
    ? items.filter((p) => p.stockQty <= p.lowStockThreshold)
    : items;

  return { items: filtered, total };
}

export async function getProduct(businessId: string, id: string) {
  const product = await prisma.product.findFirst({ where: { id, businessId }, include: { category: true } });
  if (!product) throw ApiError.notFound("Product not found");
  return product;
}

export async function getProductByBarcode(businessId: string, barcode: string) {
  const product = await prisma.product.findFirst({ where: { businessId, barcode, isActive: true } });
  if (!product) throw ApiError.notFound("No product with that barcode");
  return product;
}

export function createProduct(businessId: string, input: z.infer<typeof createProductSchema>) {
  return prisma.product.create({ data: { businessId, ...input } });
}

export async function updateProduct(businessId: string, id: string, input: z.infer<typeof updateProductSchema>) {
  const product = await prisma.product.findFirst({ where: { id, businessId } });
  if (!product) throw ApiError.notFound("Product not found");
  return prisma.product.update({ where: { id }, data: input });
}

export async function deleteProduct(businessId: string, id: string) {
  const product = await prisma.product.findFirst({ where: { id, businessId } });
  if (!product) throw ApiError.notFound("Product not found");
  await prisma.product.update({ where: { id }, data: { isActive: false } });
}

export async function stockIn(businessId: string, id: string, userId: string, input: z.infer<typeof stockMoveSchema>) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({ where: { id, businessId } });
    if (!product) throw ApiError.notFound("Product not found");

    const updated = await tx.product.update({ where: { id }, data: { stockQty: { increment: input.quantity } } });
    await tx.stockMovement.create({
      data: { businessId, productId: id, type: "IN", quantity: input.quantity, note: input.note, createdById: userId },
    });
    return updated;
  });
}

export async function stockOut(businessId: string, id: string, userId: string, input: z.infer<typeof stockMoveSchema>) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({ where: { id, businessId } });
    if (!product) throw ApiError.notFound("Product not found");
    if (product.stockQty < input.quantity) {
      throw ApiError.badRequest(`Not enough stock (available: ${product.stockQty})`);
    }

    const updated = await tx.product.update({ where: { id }, data: { stockQty: { decrement: input.quantity } } });
    await tx.stockMovement.create({
      data: { businessId, productId: id, type: "OUT", quantity: input.quantity, note: input.note, createdById: userId },
    });
    return updated;
  });
}

export async function stockAdjustment(businessId: string, id: string, userId: string, input: z.infer<typeof stockAdjustSchema>) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({ where: { id, businessId } });
    if (!product) throw ApiError.notFound("Product not found");

    const delta = input.quantity - product.stockQty;
    const updated = await tx.product.update({ where: { id }, data: { stockQty: input.quantity } });
    await tx.stockMovement.create({
      data: { businessId, productId: id, type: "ADJUSTMENT", quantity: delta, note: input.note, createdById: userId },
    });
    return updated;
  });
}

export async function listLowStock(businessId: string) {
  const products = await prisma.product.findMany({ where: { businessId, isActive: true }, orderBy: { name: "asc" } });
  return products.filter((p) => p.stockQty <= p.lowStockThreshold);
}

export async function listStockMovements(businessId: string, productId: string) {
  const product = await prisma.product.findFirst({ where: { id: productId, businessId } });
  if (!product) throw ApiError.notFound("Product not found");
  return prisma.stockMovement.findMany({ where: { businessId, productId }, orderBy: { createdAt: "desc" }, take: 50 });
}
