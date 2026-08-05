import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { z } from "zod";
import { createCategorySchema, updateCategorySchema } from "./categories.schema";

export function listCategories(businessId: string, type?: string) {
  return prisma.category.findMany({
    where: { businessId, ...(type ? { type } : {}) },
    orderBy: { name: "asc" },
  });
}

export function createCategory(businessId: string, input: z.infer<typeof createCategorySchema>) {
  return prisma.category.create({ data: { businessId, ...input } });
}

export async function updateCategory(businessId: string, id: string, input: z.infer<typeof updateCategorySchema>) {
  const category = await prisma.category.findFirst({ where: { id, businessId } });
  if (!category) throw ApiError.notFound("Category not found");
  return prisma.category.update({ where: { id }, data: input });
}

export async function deleteCategory(businessId: string, id: string) {
  const category = await prisma.category.findFirst({ where: { id, businessId } });
  if (!category) throw ApiError.notFound("Category not found");
  await prisma.category.delete({ where: { id } });
}
