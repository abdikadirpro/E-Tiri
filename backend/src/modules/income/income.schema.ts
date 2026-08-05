import { z } from "zod";

export const createIncomeSchema = z.object({
  source: z.string().min(1).max(160),
  amount: z.number().positive(),
  description: z.string().max(500).optional().nullable(),
  date: z.coerce.date().optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();
