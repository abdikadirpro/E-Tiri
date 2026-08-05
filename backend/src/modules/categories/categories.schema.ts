import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(["PRODUCT", "EXPENSE"]),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(120).optional(),
});
