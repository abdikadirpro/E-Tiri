import { prisma } from "../../lib/prisma";
import { comparePassword, hashPassword } from "../../lib/bcrypt";
import { signToken } from "../../lib/jwt";
import { ApiError } from "../../utils/ApiError";
import { LoginInput, SignupInput } from "./auth.schema";

function toPublicUser(user: { id: string; name: string; email: string; role: string; businessId: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, businessId: user.businessId };
}

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const business = await prisma.business.create({
    data: {
      name: input.businessName,
      currency: input.currency ?? "USD",
      users: {
        create: {
          name: input.name,
          email: input.email,
          passwordHash,
          role: "OWNER",
        },
      },
    },
    include: { users: true },
  });

  const user = business.users[0];
  const token = signToken({ sub: user.id, businessId: business.id, role: user.role });
  const { users: _users, ...publicBusiness } = business;

  return { token, user: toPublicUser({ ...user, businessId: business.id }), business: publicBusiness };
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
