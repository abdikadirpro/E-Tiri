import { useEffect, useState } from "react";
import { analyticsApi, CashFlowPoint, MonthlyComparison, TopCustomer, TopProduct } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatMoney } from "../../lib/format";
import { Card, DataTable } from "../../components/ui";

export function SalesAnalyticsSection({ from, to }: { from: string; to: string }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">📈 {t("analytics.title")}</h2>
      <TopProductsCard from={from} to={to} />
      <TopCustomersCard from={from} to={to} />
      <CashFlowCard from={from} to={to} />
      <MonthlyComparisonCard />
    </div>
  );
}

function TopProductsCard({ from, to }: { from: string; to: string }) {
  const { business } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<TopProduct[]>([]);

  useEffect(() => {
    analyticsApi.topProducts({ from: from || undefined, to: to || undefined, limit: 10 }).then(setItems);
  }, [from, to]);

  return (
    <Card>
      <h3 className="mb-2 text-sm font-semibold">🏆 {t("analytics.topProducts")}</h3>
      <DataTable
        columns={["#", t("inventory.name"), t("analytics.qtySold"), t("analytics.revenue")]}
        rows={items.map((i, idx) => ({ ...i, id: i.productId || String(idx) }))}
        emptyMessage={t("analytics.noSales")}
        renderRow={(p) => (
          <tr key={p.productId}>
            <td className="px-3 py-2 text-gray-400">{items.indexOf(p) + 1}</td>
            <td className="px-3 py-2 font-medium">{p.name}</td>
            <td className="px-3 py-2">
              {p.quantitySold} {p.unit ?? ""}
            </td>
            <td className="px-3 py-2 font-medium text-income">{formatMoney(p.revenue, business?.currency)}</td>
          </tr>
        )}
      />
    </Card>
  );
}

function TopCustomersCard({ from, to }: { from: string; to: string }) {
  const { business } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<TopCustomer[]>([]);

  useEffect(() => {
    analyticsApi.topCustomers({ from: from || undefined, to: to || undefined, limit: 10 }).then(setItems);
  }, [from, to]);

  return (
    <Card>
      <h3 className="mb-2 text-sm font-semibold">👥 {t("analytics.topCustomers")}</h3>
      <DataTable
        columns={["#", t("customers.title"), t("analytics.orders"), t("analytics.totalSpent")]}
        rows={items.map((i) => ({ ...i, id: i.customerId ?? i.name }))}
        emptyMessage={t("analytics.noSales")}
        renderRow={(c) => (
          <tr key={c.customerId ?? c.name}>
            <td className="px-3 py-2 text-gray-400">{items.indexOf(c) + 1}</td>
            <td className="px-3 py-2 font-medium">{c.name}</td>
            <td className="px-3 py-2">{c.orderCount}</td>
            <td className="px-3 py-2 font-medium text-dashboard">{formatMoney(c.totalSpent, business?.currency)}</td>
          </tr>
        )}
      />
    </Card>
  );
}

function CashFlowCard({ from, to }: { from: string; to: string }) {
  const { business } = useAuth();
  const { t } = useLanguage();
  const [points, setPoints] = useState<CashFlowPoint[]>([]);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    analyticsApi.cashFlow({ from: from || undefined, to: to || undefined }).then(setPoints);
  }, [from, to]);

  const max = Math.max(1, ...points.flatMap((p) => [p.cashIn, p.cashOut]));

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">📊 {t("analytics.cashFlow")}</h3>
        <button className="text-xs text-dashboard" onClick={() => setShowTable((v) => !v)}>
          {showTable ? "Chart" : "Table"}
        </button>
      </div>

      {/* legend */}
      <div className="mb-3 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-income" /> {t("analytics.cashIn")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-expense" /> {t("analytics.cashOut")}
        </span>
      </div>

      {points.length === 0 && <p className="py-6 text-center text-sm text-gray-400">{t("analytics.noSales")}</p>}

      {points.length > 0 && !showTable && (
        <div className="flex items-end gap-3 overflow-x-auto pb-2" style={{ height: 140 }}>
          {points.map((p) => (
            <div key={p.date} className="flex h-full flex-shrink-0 flex-col items-center justify-end gap-1" style={{ width: 28 }}>
              <div className="flex h-full items-end gap-0.5">
                <div
                  title={`${t("analytics.cashIn")}: ${formatMoney(p.cashIn, business?.currency)}`}
                  className="w-3 rounded-t bg-income"
                  style={{ height: `${(p.cashIn / max) * 100}%`, minHeight: p.cashIn > 0 ? 2 : 0 }}
                />
                <div
                  title={`${t("analytics.cashOut")}: ${formatMoney(p.cashOut, business?.currency)}`}
                  className="w-3 rounded-t bg-expense"
                  style={{ height: `${(p.cashOut / max) * 100}%`, minHeight: p.cashOut > 0 ? 2 : 0 }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{p.date.slice(5)}</span>
            </div>
          ))}
        </div>
      )}

      {points.length > 0 && showTable && (
        <DataTable
          columns={[t("income.date"), t("analytics.cashIn"), t("analytics.cashOut"), t("common.total")]}
          rows={points.map((p) => ({ ...p, id: p.date }))}
          renderRow={(p) => (
            <tr key={p.date}>
              <td className="px-3 py-2">{p.date}</td>
              <td className="px-3 py-2 text-income">{formatMoney(p.cashIn, business?.currency)}</td>
              <td className="px-3 py-2 text-expense">{formatMoney(p.cashOut, business?.currency)}</td>
              <td className={`px-3 py-2 font-medium ${p.net >= 0 ? "text-income" : "text-expense"}`}>
                {formatMoney(p.net, business?.currency)}
              </td>
            </tr>
          )}
        />
      )}
    </Card>
  );
}

function ChangeBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const positive = value >= 0;
  return (
    <span className={`ml-1 text-xs font-medium ${positive ? "text-income" : "text-expense"}`}>
      {positive ? "▲" : "▼"} {Math.abs(value).toFixed(0)}%
    </span>
  );
}

function MonthlyComparisonCard() {
  const { business } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<MonthlyComparison | null>(null);

  useEffect(() => {
    analyticsApi.monthlyComparison().then(setData);
  }, []);

  if (!data) return null;

  const rows: { label: string; key: keyof MonthlyComparison["current"] }[] = [
    { label: t("dashboard.totalIncome"), key: "income" },
    { label: t("dashboard.totalExpenses"), key: "expenses" },
    { label: t("dashboard.profit"), key: "profit" },
    { label: t("analytics.orders"), key: "salesCount" },
  ];

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">📅 {t("analytics.monthlyComparison")}</h3>
      <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-400">
        <span />
        <span className="text-right">{t("analytics.thisMonth")} / {t("analytics.lastMonth")}</span>
      </div>
      <ul className="mt-1 space-y-2 text-sm">
        {rows.map((row) => {
          const current = data.current[row.key];
          const previous = data.previous[row.key];
          const change = data.change[row.key as keyof MonthlyComparison["change"]];
          const isMoney = row.key !== "salesCount";
          return (
            <li key={row.key} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 dark:border-gray-800">
              <span>{row.label}</span>
              <span className="text-right">
                <span className="font-semibold">{isMoney ? formatMoney(current, business?.currency) : current}</span>
                <span className="text-gray-400"> / {isMoney ? formatMoney(previous, business?.currency) : previous}</span>
                <ChangeBadge value={change} />
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
