import { z } from "zod";

export const updateBusinessSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  phone: z.string().max(32).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  currency: z.string().min(2).max(8).optional(),
  language: z.enum(["SO", "EN"]).optional(),
  logoUrl: z.string().url().max(500).optional().nullable(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).max(72).optional(),
});
