import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const business = await prisma.business.create({
    data: {
      name: "Demo Store",
      phone: "+252611234567",
      address: "Mogadishu, Somalia",
      currency: "USD",
      language: "SO",
      users: {
        create: {
          name: "Demo Owner",
          email: "owner@e-tiri.demo",
          passwordHash,
          role: "OWNER",
        },
      },
    },
  });

  const productCategory = await prisma.category.create({
    data: { businessId: business.id, name: "General", type: "PRODUCT" },
  });

  const expenseCategory = await prisma.category.create({
    data: { businessId: business.id, name: "Kirada", type: "EXPENSE" },
  });

  await prisma.product.createMany({
    data: [
      {
        businessId: business.id,
        categoryId: productCategory.id,
        name: "Rooti",
        barcode: "1000001",
        sellingPrice: 1.5,
        costPrice: 1.0,
        stockQty: 50,
        unit: "pcs",
      },
      {
        businessId: business.id,
        categoryId: productCategory.id,
        name: "Sonkor (kg)",
        barcode: "1000002",
        sellingPrice: 2.0,
        costPrice: 1.4,
        stockQty: 30,
        unit: "kg",
      },
      {
        businessId: business.id,
        categoryId: productCategory.id,
        name: "Bariis (kg)",
        barcode: "1000003",
        sellingPrice: 1.8,
        costPrice: 1.2,
        stockQty: 4,
        lowStockThreshold: 5,
        unit: "kg",
      },
    ],
  });

  const customer = await prisma.customer.create({
    data: { businessId: business.id, name: "Cali Xasan", phone: "+252611111111" },
  });

  await prisma.supplier.create({
    data: { businessId: business.id, name: "Boosaaso Traders", phone: "+252622222222" },
  });

  await prisma.income.create({
    data: {
      businessId: business.id,
      source: "Opening balance",
      amount: 500,
      description: "Lacagta bilowga ah",
    },
  });

  await prisma.expense.create({
    data: {
      businessId: business.id,
      categoryId: expenseCategory.id,
      amount: 120,
      description: "Kiro bisha",
    },
  });

  console.log("Seed complete.");
  console.log("Login with: owner@e-tiri.demo / password123");
  console.log(`Business: ${business.name} (${business.id})`);
  console.log(`Sample customer: ${customer.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
