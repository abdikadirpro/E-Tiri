import { prisma } from "../../lib/prisma";
import { comparePassword } from "../../lib/bcrypt";
import { signToken } from "../../lib/jwt";
import { ApiError } from "../../utils/ApiError";
import { LoginInput } from "./auth.schema";

function toPublicUser(user: { id: string; name: string; email: string; role: string; businessId: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, businessId: user.businessId };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const business = await prisma.business.findUniqueOrThrow({ where: { id: user.businessId } });
  const token = signToken({ sub: user.id, businessId: business.id, role: user.role });

  return { token, user: toPublicUser(user), business };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const business = await prisma.business.findUniqueOrThrow({ where: { id: user.businessId } });
  return { user: toPublicUser(user), business };
}
