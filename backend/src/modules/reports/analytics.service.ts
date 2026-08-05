import { prisma } from "../../lib/prisma";
import { buildDateRange } from "../../utils/pagination";

export async function getTopProducts(businessId: string, from?: unknown, to?: unknown, limit = 10) {
  const dateRange = buildDateRange(from, to);
  const sales = await prisma.sale.findMany({
    where: { businessId, ...(dateRange ? { createdAt: dateRange } : {}) },
    select: { id: true },
  });
  const saleIds = sales.map((s) => s.id);
  if (!saleIds.length) return [];

  const grouped = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: { saleId: { in: saleIds } },
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take: limit,
  });

  const products = await prisma.product.findMany({ where: { id: { in: grouped.map((g) => g.productId) } } });
  const productById = new Map(products.map((p) => [p.id, p]));

  return grouped.map((g) => ({
    productId: g.productId,
    name: productById.get(g.productId)?.name ?? "Unknown",
    unit: productById.get(g.productId)?.unit ?? null,
    quantitySold: g._sum.quantity ?? 0,
    revenue: Number(g._sum.lineTotal ?? 0),
  }));
}

export async function getTopCustomers(businessId: string, from?: unknown, to?: unknown, limit = 10) {
  const dateRange = buildDateRange(from, to);
  const grouped = await prisma.sale.groupBy({
    by: ["customerId"],
    where: { businessId, customerId: { not: null }, ...(dateRange ? { createdAt: dateRange } : {}) },
    _sum: { total: true },
    _count: { id: true },
    orderBy: { _sum: { total: "desc" } },
    take: limit,
  });

  const customerIds = grouped.map((g) => g.customerId).filter((id): id is string => !!id);
  const customers = await prisma.customer.findMany({ where: { id: { in: customerIds } } });
  const customerById = new Map(customers.map((c) => [c.id, c]));

  return grouped.map((g) => ({
    customerId: g.customerId,
    name: g.customerId ? customerById.get(g.customerId)?.name ?? "Unknown" : "Unknown",
    orderCount: g._count.id,
    totalSpent: Number(g._sum.total ?? 0),
  }));
}

export async function getCashFlow(businessId: string, from?: unknown, to?: unknown) {
  const dateRange = buildDateRange(from, to);
  const defaultFrom = dateRange?.gte ?? new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  const defaultTo = dateRange?.lte ?? new Date();

  const [incomes, expenses, sales] = await Promise.all([
    prisma.income.findMany({ where: { businessId, date: { gte: defaultFrom, lte: defaultTo } } }),
    prisma.expense.findMany({ where: { businessId, date: { gte: defaultFrom, lte: defaultTo } } }),
    prisma.sale.findMany({ where: { businessId, createdAt: { gte: defaultFrom, lte: defaultTo } } }),
  ]);

  const byDate = new Map<string, { cashIn: number; cashOut: number }>();

  function bucket(date: Date) {
    const key = date.toISOString().slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, { cashIn: 0, cashOut: 0 });
    return byDate.get(key)!;
  }

  incomes.forEach((i) => (bucket(i.date).cashIn += Number(i.amount)));
  sales.forEach((s) => (bucket(s.createdAt).cashIn += Number(s.amountPaid)));
  expenses.forEach((e) => (bucket(e.date).cashOut += Number(e.amount)));

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, cashIn: v.cashIn, cashOut: v.cashOut, net: v.cashIn - v.cashOut }));
}

function monthRange(monthsAgo: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

async function monthFigures(businessId: string, start: Date, end: Date) {
  const [incomeAgg, expenseAgg, salesAgg] = await Promise.all([
    prisma.income.aggregate({ where: { businessId, date: { gte: start, lte: end } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { businessId, date: { gte: start, lte: end } }, _sum: { amount: true } }),
    prisma.sale.aggregate({ where: { businessId, createdAt: { gte: start, lte: end } }, _sum: { total: true }, _count: { id: true } }),
  ]);

  const income = Number(incomeAgg._sum.amount ?? 0) + Number(salesAgg._sum.total ?? 0);
  const expenses = Number(expenseAgg._sum.amount ?? 0);

  return {
    income,
    expenses,
    profit: income - expenses,
    salesCount: salesAgg._count.id,
    salesRevenue: Number(salesAgg._sum.total ?? 0),
  };
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export async function getMonthlyComparison(businessId: string) {
  const thisMonth = monthRange(0);
  const lastMonth = monthRange(1);

  const [current, previous] = await Promise.all([
    monthFigures(businessId, thisMonth.start, thisMonth.end),
    monthFigures(businessId, lastMonth.start, lastMonth.end),
  ]);

  return {
    current,
    previous,
    change: {
      income: percentChange(current.income, previous.income),
      expenses: percentChange(current.expenses, previous.expenses),
      profit: percentChange(current.profit, previous.profit),
      salesCount: percentChange(current.salesCount, previous.salesCount),
    },
  };
}
