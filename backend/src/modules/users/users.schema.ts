import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(72),
  role: z.enum(["ADMIN", "STAFF"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: z.enum(["OWNER", "ADMIN", "STAFF"]).optional(),
  isActive: z.boolean().optional(),
});
