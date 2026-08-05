import { prisma } from "../../lib/prisma";
import { buildDateRange } from "../../utils/pagination";
import { ApiError } from "../../utils/ApiError";

export type ReportType = "income" | "expenses" | "profit-loss" | "sales" | "inventory";

export interface ReportData {
  title: string;
  columns: string[];
  rows: (string | number)[][];
  summary: { label: string; value: string | number }[];
}

export async function getReportData(businessId: string, type: ReportType, from?: unknown, to?: unknown): Promise<ReportData> {
  const dateRange = buildDateRange(from, to);

  switch (type) {
    case "income": {
      const items = await prisma.income.findMany({
        where: { businessId, ...(dateRange ? { date: dateRange } : {}) },
        orderBy: { date: "desc" },
      });
      const total = items.reduce((s, i) => s + Number(i.amount), 0);
      return {
        title: "Income Report",
        columns: ["Date", "Source", "Description", "Amount"],
        rows: items.map((i) => [i.date.toISOString().slice(0, 10), i.source, i.description ?? "", Number(i.amount)]),
        summary: [{ label: "Total Income", value: total }],
      };
    }
    case "expenses": {
      const items = await prisma.expense.findMany({
        where: { businessId, ...(dateRange ? { date: dateRange } : {}) },
        include: { category: true },
        orderBy: { date: "desc" },
      });
      const total = items.reduce((s, i) => s + Number(i.amount), 0);
      return {
        title: "Expenses Report",
        columns: ["Date", "Category", "Description", "Amount"],
        rows: items.map((i) => [i.date.toISOString().slice(0, 10), i.category?.name ?? "", i.description ?? "", Number(i.amount)]),
        summary: [{ label: "Total Expenses", value: total }],
      };
    }
    case "profit-loss": {
      const [incomeAgg, salesAgg, expenseAgg] = await Promise.all([
        prisma.income.aggregate({ where: { businessId, ...(dateRange ? { date: dateRange } : {}) }, _sum: { amount: true } }),
        prisma.sale.aggregate({ where: { businessId, ...(dateRange ? { createdAt: dateRange } : {}) }, _sum: { total: true } }),
        prisma.expense.aggregate({ where: { businessId, ...(dateRange ? { date: dateRange } : {}) }, _sum: { amount: true } }),
      ]);
      const totalIncome = Number(incomeAgg._sum.amount ?? 0) + Number(salesAgg._sum.total ?? 0);
      const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
      const net = totalIncome - totalExpenses;
      return {
        title: "Profit & Loss Report",
        columns: ["Item", "Amount"],
        rows: [
          ["Manual Income", Number(incomeAgg._sum.amount ?? 0)],
          ["Sales Revenue", Number(salesAgg._sum.total ?? 0)],
          ["Total Income", totalIncome],
          ["Total Expenses", totalExpenses],
          [net >= 0 ? "Profit" : "Loss", Math.abs(net)],
        ],
        summary: [
          { label: "Total Income", value: totalIncome },
          { label: "Total Expenses", value: totalExpenses },
          { label: net >= 0 ? "Profit" : "Loss", value: Math.abs(net) },
        ],
      };
    }
    case "sales": {
      const items = await prisma.sale.findMany({
        where: { businessId, ...(dateRange ? { createdAt: dateRange } : {}) },
        include: { customer: true, items: true },
        orderBy: { createdAt: "desc" },
      });
      const total = items.reduce((s, i) => s + Number(i.total), 0);
      return {
        title: "Sales Report",
        columns: ["Date", "Sale #", "Customer", "Items", "Total", "Status"],
        rows: items.map((i) => [
          i.createdAt.toISOString().slice(0, 10),
          i.saleNumber,
          i.customer?.name ?? "Walk-in",
          i.items.length,
          Number(i.total),
          i.paymentStatus,
        ]),
        summary: [{ label: "Total Sales", value: total }],
      };
    }
    case "inventory": {
      const items = await prisma.product.findMany({
        where: { businessId, isActive: true },
        include: { category: true },
        orderBy: { name: "asc" },
      });
      const stockValue = items.reduce((s, i) => s + i.stockQty * Number(i.costPrice), 0);
      return {
        title: "Inventory Report",
        columns: ["Name", "Category", "Barcode", "Stock", "Cost Price", "Selling Price"],
        rows: items.map((i) => [i.name, i.category?.name ?? "", i.barcode ?? "", i.stockQty, Number(i.costPrice), Number(i.sellingPrice)]),
        summary: [{ label: "Total Stock Value", value: stockValue }],
      };
    }
    default:
      throw ApiError.badRequest("Unknown report type");
  }
}
