import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(1).max(160),
  phone: z.string().max(32).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
});

export const updateSupplierSchema = createSupplierSchema.partial();
