import { prisma } from "../../lib/prisma";
import { buildDateRange } from "../../utils/pagination";

export async function getSummary(businessId: string, from?: unknown, to?: unknown) {
  const dateRange = buildDateRange(from, to);
  const dateWhere = dateRange ? { date: dateRange } : {};
  const createdAtWhere = dateRange ? { createdAt: dateRange } : {};

  const [incomeAgg, salesAgg, expenseAgg, saleItemsForCogs, products, recentIncome, recentExpenses, recentSales] =
    await Promise.all([
      prisma.income.aggregate({ where: { businessId, ...dateWhere }, _sum: { amount: true } }),
      prisma.sale.aggregate({ where: { businessId, ...createdAtWhere }, _sum: { total: true, amountPaid: true } }),
      prisma.expense.aggregate({ where: { businessId, ...dateWhere }, _sum: { amount: true } }),
      prisma.saleItem.findMany({
        where: { sale: { businessId, ...createdAtWhere } },
        select: { quantity: true, product: { select: { costPrice: true } } },
      }),
      prisma.product.findMany({ where: { businessId, isActive: true }, select: { stockQty: true, costPrice: true, lowStockThreshold: true } }),
      prisma.income.findMany({ where: { businessId }, orderBy: { date: "desc" }, take: 5 }),
      prisma.expense.findMany({ where: { businessId }, orderBy: { date: "desc" }, take: 5, include: { category: true } }),
      prisma.sale.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 5, include: { customer: true } }),
    ]);

  const manualIncome = Number(incomeAgg._sum.amount ?? 0);
  const salesRevenue = Number(salesAgg._sum.total ?? 0);
  const salesCashCollected = Number(salesAgg._sum.amountPaid ?? 0);
  const totalIncome = manualIncome + salesRevenue;
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
  const cogs = saleItemsForCogs.reduce((sum, item) => sum + item.quantity * Number(item.product.costPrice), 0);

  const netResult = totalIncome - totalExpenses - cogs;
  const profit = Math.max(0, netResult);
  const loss = Math.max(0, -netResult);

  const cashBalance = manualIncome + salesCashCollected - totalExpenses;
  const stockValue = products.reduce((sum, p) => sum + p.stockQty * Number(p.costPrice), 0);
  const stockOnHand = products.reduce((sum, p) => sum + p.stockQty, 0);
  const lowStockCount = products.filter((p) => p.stockQty <= p.lowStockThreshold).length;

  return {
    totalIncome,
    totalExpenses,
    profit,
    loss,
    cashBalance,
    stockOnHand,
    stockValue,
    lowStockCount,
    recentActivity: {
      income: recentIncome,
      expenses: recentExpenses,
      sales: recentSales,
    },
  };
}

export async function getLowStockProducts(businessId: string) {
  const products = await prisma.product.findMany({ where: { businessId, isActive: true }, orderBy: { name: "asc" } });
  return products.filter((p) => p.stockQty <= p.lowStockThreshold);
}
