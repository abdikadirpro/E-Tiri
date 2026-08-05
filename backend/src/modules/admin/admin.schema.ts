import { z } from "zod";

export const createBusinessSchema = z.object({
  businessName: z.string().min(2).max(120),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(72),
  currency: z.string().min(2).max(8).optional(),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
