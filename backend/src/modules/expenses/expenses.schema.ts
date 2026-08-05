import { z } from "zod";

export const createExpenseSchema = z.object({
  categoryId: z.string().optional().nullable(),
  amount: z.number().positive(),
  description: z.string().max(500).optional().nullable(),
  date: z.coerce.date().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
