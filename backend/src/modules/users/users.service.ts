import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/bcrypt";
import { ApiError } from "../../utils/ApiError";
import { z } from "zod";
import { createUserSchema, updateUserSchema } from "./users.schema";

const select = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } as const;

export function listUsers(businessId: string) {
  return prisma.user.findMany({ where: { businessId }, select, orderBy: { createdAt: "asc" } });
}

export async function createUser(businessId: string, input: z.infer<typeof createUserSchema>) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: { businessId, name: input.name, email: input.email, passwordHash, role: input.role },
    select,
  });
}

export async function updateUser(businessId: string, id: string, input: z.infer<typeof updateUserSchema>) {
  const user = await prisma.user.findFirst({ where: { id, businessId } });
  if (!user) throw ApiError.notFound("Staff member not found");
  return prisma.user.update({ where: { id }, data: input, select });
}

export async function deactivateUser(businessId: string, id: string) {
  const user = await prisma.user.findFirst({ where: { id, businessId } });
  if (!user) throw ApiError.notFound("Staff member not found");
  if (user.role === "OWNER") throw ApiError.badRequest("Cannot deactivate the business owner");
  return prisma.user.update({ where: { id }, data: { isActive: false }, select });
}
