import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

export const createSaleSchema = z.object({
  customerId: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1),
  discount: z.number().nonnegative().default(0),
  vatAmount: z.number().nonnegative().default(0),
  amountPaid: z.number().nonnegative(),
});
