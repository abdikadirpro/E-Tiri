import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/bcrypt";
import { ApiError } from "../../utils/ApiError";
import { CreateBusinessInput } from "./admin.schema";

export async function createBusiness(input: CreateBusinessInput) {
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
    include: { users: { select: { id: true, name: true, email: true, role: true } } },
  });

  const { users, ...publicBusiness } = business;
  return { business: publicBusiness, owner: users[0] };
}
