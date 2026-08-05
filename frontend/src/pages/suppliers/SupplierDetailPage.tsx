import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { suppliersApi } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatMoney } from "../../lib/format";
import { Badge, Card, DataTable, StatCard } from "../../components/ui";
import type { Debt, Supplier } from "../../types";

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { business } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<{ supplier: Supplier; debts: Debt[]; owedBalance: number } | null>(null);

  useEffect(() => {
    if (id) suppliersApi.get(id).then(setData);
  }, [id]);

  if (!data) return <p className="py-10 text-center text-gray-400">{t("common.loading")}</p>;

  return (
    <div className="space-y-3">
      <Link to="/suppliers" className="text-sm text-dashboard">
        ← {t("suppliers.title")}
      </Link>

      <Card>
        <h1 className="text-lg font-bold">{data.supplier.name}</h1>
        <p className="text-sm text-gray-500">{data.supplier.phone}</p>
        <p className="text-sm text-gray-500">{data.supplier.address}</p>
      </Card>

      <StatCard label={t("debts.payable")} value={formatMoney(data.owedBalance, business?.currency)} variant="expense" />

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
