import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { customersApi } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatDate, formatMoney } from "../../lib/format";
import { Badge, Card, DataTable, StatCard } from "../../components/ui";
import type { Customer, Debt, Sale } from "../../types";

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { business } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<{ customer: Customer; sales: Sale[]; debts: Debt[]; debtBalance: number } | null>(null);

  useEffect(() => {
    if (id) customersApi.get(id).then(setData);
  }, [id]);

  if (!data) return <p className="py-10 text-center text-gray-400">{t("common.loading")}</p>;

  return (
    <div className="space-y-3">
      <Link to="/customers" className="text-sm text-dashboard">
        ← {t("customers.title")}
      </Link>

      <Card>
        <h1 className="text-lg font-bold">{data.customer.name}</h1>
        <p className="text-sm text-gray-500">{data.customer.phone}</p>
        <p className="text-sm text-gray-500">{data.customer.address}</p>
      </Card>

      <StatCard label={t("customers.debt")} value={formatMoney(data.debtBalance, business?.currency)} variant="expense" />

      <Card>
        <h2 className="mb-2 text-sm font-semibold">{t("sales.title")}</h2>
        <DataTable
          columns={["#", t("income.date"), t("common.total"), t("common.status")]}
          rows={data.sales}
          emptyMessage={t("common.noData")}
          renderRow={(s) => (
            <tr key={s.id}>
              <td className="px-3 py-2">{s.saleNumber}</td>
              <td className="px-3 py-2">{formatDate(s.createdAt)}</td>
              <td className="px-3 py-2">{formatMoney(s.total, business?.currency)}</td>
              <td className="px-3 py-2">
                <Badge variant={s.paymentStatus === "PAID" ? "income" : s.paymentStatus === "PARTIAL" ? "reports" : "expense"}>
                  {s.paymentStatus}
                </Badge>
              </td>
            </tr>
          )}
        />
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold">{t("debts.title")}</h2>
        <DataTable
          columns={[t("customers.debt"), t("common.status"), t("common.total")]}
          rows={data.debts}
          emptyMessage={t("common.noData")}
          renderRow={(d) => (
            <tr key={d.id}>
              <td className="px-3 py-2">{formatMoney(d.originalAmount, business?.currency)}</td>
              <td className="px-3 py-2">
                <Badge variant={d.status === "PAID" ? "income" : d.status === "PARTIAL" ? "reports" : "expense"}>{d.status}</Badge>
              </td>
              <td className="px-3 py-2 font-medium">{formatMoney(d.balance, business?.currency)}</td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}
