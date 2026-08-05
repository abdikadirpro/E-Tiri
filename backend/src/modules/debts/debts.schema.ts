import { z } from "zod";

export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  note: z.string().max(255).optional().nullable(),
  paidAt: z.coerce.date().optional(),
});

export const createDebtSchema = z.object({
  direction: z.enum(["RECEIVABLE", "PAYABLE"]),
  customerId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  originalAmount: z.number().positive(),
  dueDate: z.coerce.date().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});
