import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsApi, CashFlowPoint, dashboardApi } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatMoney } from "../../lib/format";
import { Card, StatCard } from "../../components/ui";
import type { DashboardSummary } from "../../types";

export function DashboardPage() {
  const { business } = useAuth();
  const { t } = useLanguage();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .summary()
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  const currency = business?.currency ?? "USD";

  if (loading) return <p className="py-10 text-center text-gray-400">{t("common.loading")}</p>;
  if (!summary) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("dashboard.title")}</h1>
        <Link to="/transactions/sales/new" className="rounded-lg bg-dashboard px-4 py-2 text-sm font-semibold text-white">
          🛒 {t("quick.newSale")}
        </Link>
      </div>

      {summary.lowStockCount > 0 && (
        <Link
          to="/inventory?lowStock=true"
          className="block rounded-lg bg-reports-light px-4 py-3 text-sm font-medium text-reports"
        >
          ⚠️ {summary.lowStockCount} {t("dashboard.lowStock")}
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t("dashboard.totalIncome")} value={formatMoney(summary.totalIncome, currency)} variant="income" />
        <StatCard label={t("dashboard.todaySales")} value={formatMoney(summary.todaySales, currency)} variant="dashboard" />
        <StatCard label={t("dashboard.totalExpenses")} value={formatMoney(summary.totalExpenses, currency)} variant="expense" />
        <StatCard label={t("dashboard.profit")} value={formatMoney(summary.profit, currency)} variant="dashboard" />
        <StatCard label={t("dashboard.lowStock")} value={summary.lowStockCount} variant="reports" />
        <StatCard label={t("dashboard.outOfStock")} value={summary.outOfStockCount} variant="expense" />
        <StatCard label={t("debts.receivable")} value={formatMoney(summary.debtReceivable, currency)} variant="income" />
        <StatCard label={t("debts.payable")} value={formatMoney(summary.debtPayable, currency)} variant="expense" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TrendCard title={t("dashboard.incomeTrend")} field="cashIn" variant="income" />
        <TrendCard title={t("dashboard.expenseTrend")} field="cashOut" variant="expense" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Link to="/transactions?add=income" className="rounded-lg bg-income py-3 text-center text-xs font-semibold text-white">
          ➕ {t("quick.addIncome")}
        </Link>
        <Link to="/transactions?add=expense" className="rounded-lg bg-expense py-3 text-center text-xs font-semibold text-white">
          ➖ {t("quick.addExpense")}
        </Link>
        <Link to="/inventory?add=product" className="rounded-lg bg-reports py-3 text-center text-xs font-semibold text-white">
          📦 {t("quick.newProduct")}
        </Link>
        <Link to="/customers?add=customer" className="rounded-lg bg-dashboard py-3 text-center text-xs font-semibold text-white">
          👤 {t("quick.newCustomer")}
        </Link>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">{t("dashboard.recentActivity")}</h2>
        <ul className="space-y-2 text-sm">
          {summary.recentActivity.sales.map((s) => (
            <li key={s.id} className="flex justify-between border-b border-gray-100 pb-2 last:border-0 dark:border-gray-800">
              <span>🛒 {t("sales.title")} #{s.saleNumber}</span>
              <span className="font-medium text-dashboard">{formatMoney(s.total, currency)}</span>
            </li>
          ))}
          {summary.recentActivity.income.map((i) => (
            <li key={i.id} className="flex justify-between border-b border-gray-100 pb-2 last:border-0 dark:border-gray-800">
              <span>➕ {i.source}</span>
              <span className="font-medium text-income">{formatMoney(i.amount, currency)}</span>
            </li>
          ))}
          {summary.recentActivity.expenses.map((e) => (
            <li key={e.id} className="flex justify-between border-b border-gray-100 pb-2 last:border-0 dark:border-gray-800">
              <span>➖ {e.description ?? e.category?.name ?? t("expense.title")}</span>
              <span className="font-medium text-expense">{formatMoney(e.amount, currency)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function TrendCard({ title, field, variant }: { title: string; field: "cashIn" | "cashOut"; variant: "income" | "expense" }) {
  const { t } = useLanguage();
  const [points, setPoints] = useState<CashFlowPoint[]>([]);

  useEffect(() => {
    analyticsApi.cashFlow().then(setPoints);
  }, []);

  const total = points.reduce((sum, p) => sum + p[field], 0);
  const max = Math.max(1, ...points.map((p) => p[field]));
  const barColor = variant === "income" ? "bg-income" : "bg-expense";

  return (
    <Card>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <span className="text-2xl">📉</span>
          <p className="mt-1 text-sm">{t("analytics.noSales")}</p>
        </div>
      ) : (
        <div className="flex items-end gap-1 overflow-x-auto pb-1" style={{ height: 110 }}>
          {points.map((p) => (
            <div
              key={p.date}
              title={`${p.date}: ${p[field]}`}
              className={`w-2.5 flex-shrink-0 rounded-t ${barColor}`}
              style={{ height: `${(p[field] / max) * 100}%`, minHeight: p[field] > 0 ? 2 : 0 }}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
