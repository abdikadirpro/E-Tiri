import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(160),
  barcode: z.string().max(64).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  sellingPrice: z.number().nonnegative(),
  costPrice: z.number().nonnegative(),
  stockQty: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(5),
  unit: z.string().max(32).optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export const stockMoveSchema = z.object({
  quantity: z.number().int().positive(),
  note: z.string().max(255).optional().nullable(),
});

export const stockAdjustSchema = z.object({
  quantity: z.number().int().nonnegative(),
  note: z.string().max(255).optional().nullable(),
});
