import { useEffect, useState } from "react";
import { reportsApi, ReportData, ReportType } from "../../api/endpoints";
import { useLanguage } from "../../context/LanguageContext";
import { Button, Card, DateRangePicker } from "../../components/ui";
import { SalesAnalyticsSection } from "./SalesAnalyticsSection";

type ViewType = ReportType | "analytics";

const reportTypes: { key: ViewType; labelKey: string; icon?: string }[] = [
  { key: "income", labelKey: "income.title" },
  { key: "expenses", labelKey: "expense.title" },
  { key: "profit-loss", labelKey: "dashboard.profit" },
  { key: "sales", labelKey: "sales.title" },
  { key: "inventory", labelKey: "inventory.title" },
  { key: "analytics", labelKey: "analytics.title", icon: "📈" },
];

export function ReportsPage() {
  const { t } = useLanguage();
  const [type, setType] = useState<ViewType>("income");
  const [range, setRange] = useState({ from: "", to: "" });
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === "analytics") return;
    setLoading(true);
    reportsApi
      .get(type, { from: range.from || undefined, to: range.to || undefined })
      .then(setData)
      .finally(() => setLoading(false));
  }, [type, range]);

  const exportParams = { from: range.from || undefined, to: range.to || undefined };

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">{t("reports.title")}</h1>

      <div className="flex flex-wrap gap-2">
        {reportTypes.map((rt) => (
          <button
            key={rt.key}
            onClick={() => setType(rt.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              type === rt.key ? "bg-reports text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {rt.icon ? `${rt.icon} ` : ""}
            {t(rt.labelKey as never)}
          </button>
        ))}
      </div>

      <DateRangePicker from={range.from} to={range.to} onChange={setRange} />

      {type === "analytics" ? (
        <SalesAnalyticsSection from={range.from} to={range.to} />
      ) : (
        <>
          <div className="flex justify-end gap-2">
            <a href={reportsApi.exportUrl(type, "pdf", exportParams)} target="_blank" rel="noreferrer">
              <Button variant="reports" outline>
                {t("reports.pdf")}
              </Button>
            </a>
            <a href={reportsApi.exportUrl(type, "excel", exportParams)} target="_blank" rel="noreferrer">
              <Button variant="reports" outline>
                {t("reports.excel")}
              </Button>
            </a>
          </div>

          {loading && <p className="py-10 text-center text-gray-400">{t("common.loading")}</p>}

          {!loading && data && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {data.summary.map((s) => (
                  <Card key={s.label}>
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className="text-lg font-bold text-reports">{s.value}</p>
                  </Card>
                ))}
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs uppercase text-gray-400 dark:border-gray-800">
                        {data.columns.map((c) => (
                          <th key={c} className="px-3 py-2 font-medium">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {data.rows.length === 0 && (
                        <tr>
                          <td colSpan={data.columns.length} className="px-3 py-6 text-center text-gray-400">
                            {t("common.noData")}
                          </td>
                        </tr>
                      )}
                      {data.rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} className="px-3 py-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
