import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../../api/endpoints";
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
      <h1 className="text-xl font-bold">{t("dashboard.title")}</h1>

      {summary.lowStockCount > 0 && (
        <Link
          to="/inventory?lowStock=true"
          className="block rounded-lg bg-reports-light px-4 py-3 text-sm font-medium text-reports"
        >
          ⚠️ {summary.lowStockCount} {t("dashboard.lowStock")}
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t("dashboard.totalIncome")} value={formatMoney(summary.totalIncome, currency)} variant="income" />
        <StatCard label={t("dashboard.totalExpenses")} value={formatMoney(summary.totalExpenses, currency)} variant="expense" />
        <StatCard label={t("dashboard.profit")} value={formatMoney(summary.profit, currency)} variant="dashboard" />
        <StatCard label={t("dashboard.loss")} value={formatMoney(summary.loss, currency)} variant="expense" />
        <StatCard label={t("dashboard.cashBalance")} value={formatMoney(summary.cashBalance, currency)} variant="dashboard" />
        <StatCard label={t("dashboard.stockOnHand")} value={summary.stockOnHand} variant="reports" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Link to="/transactions?add=income" className="rounded-lg bg-income py-3 text-center text-xs font-semibold text-white">
          ➕ {t("quick.addIncome")}
        </Link>
        <Link to="/transactions?add=expense" className="rounded-lg bg-expense py-3 text-center text-xs font-semibold text-white">
          ➖ {t("quick.addExpense")}
        </Link>
        <Link to="/transactions/sales/new" className="rounded-lg bg-dashboard py-3 text-center text-xs font-semibold text-white">
          🛒 {t("quick.newSale")}
        </Link>
        <Link to="/inventory?add=product" className="rounded-lg bg-reports py-3 text-center text-xs font-semibold text-white">
          📦 {t("quick.newProduct")}
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
