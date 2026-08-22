import { ReactNode, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Button, LockIcon, Modal } from "./ui";
import type { TranslationKey } from "../i18n";

type Period = "monthly" | "sixMonth" | "annual";

const PRICES: Record<Period, { pro: number; business: number }> = {
  monthly: { pro: 4.99, business: 9.99 },
  sixMonth: { pro: 3.99, business: 7.99 },
  annual: { pro: 2.99, business: 5.99 },
};

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period>("monthly");
  const [confirmed, setConfirmed] = useState(false);

  function close() {
    onClose();
    setConfirmed(false);
    setPeriod("monthly");
  }

  const prices = PRICES[period];

  return (
    <Modal open={open} onClose={close} title={confirmed ? t("upgrade.title") : t("upgrade.choosePlan")} size={confirmed ? "md" : "lg"}>
      {confirmed ? (
        <>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-income-light text-income">
            <LockIcon className="h-7 w-7" />
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">{t("upgrade.message")}</p>
          <Button className="mt-4 w-full" onClick={close}>
            {t("common.cancel")}
          </Button>
        </>
      ) : (
        <div>
          <div className="mb-5 flex justify-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {(["monthly", "sixMonth", "annual"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  period === p ? "bg-white text-dashboard shadow dark:bg-gray-900" : "text-gray-500"
                }`}
              >
                {t(`upgrade.period.${p}` as TranslationKey)}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <PlanCard
              icon="⚡"
              name={t("upgrade.plan.free")}
              badgeLabel={t("upgrade.currentPlan")}
              description={t("upgrade.plan.freeDesc")}
              price="$0.00"
              features={[
                t("upgrade.feature.basicSales"),
                t("upgrade.feature.basicInventory"),
                t("upgrade.feature.customerRecords"),
                t("upgrade.feature.dataExport"),
              ]}
            />
            <PlanCard
              icon="⚡"
              name={t("upgrade.plan.pro")}
              badgeLabel={t("upgrade.mostPopular")}
              highlight
              description={t("upgrade.plan.proDesc")}
              price={`$${prices.pro.toFixed(2)}`}
              priceSuffix={t("upgrade.perMonth")}
              features={[
                t("upgrade.feature.everythingFree"),
                t("upgrade.feature.incomeExpense"),
                t("upgrade.feature.debtBudget"),
                t("upgrade.feature.advancedReports"),
              ]}
              onSelect={() => setConfirmed(true)}
              selectLabel={t("upgrade.selectPlan")}
            />
            <PlanCard
              icon="🏢"
              name={t("upgrade.plan.business")}
              description={t("upgrade.plan.businessDesc")}
              price={`$${prices.business.toFixed(2)}`}
              priceSuffix={t("upgrade.perMonth")}
              features={[
                t("upgrade.feature.everythingPro"),
                t("upgrade.feature.teamAccounts"),
                t("upgrade.feature.inventoryAnalytics"),
                t("upgrade.feature.businessReports"),
                t("upgrade.feature.adminUsers"),
              ]}
              onSelect={() => setConfirmed(true)}
              selectLabel={t("upgrade.selectPlan")}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}

function PlanCard({
  icon,
  name,
  badgeLabel,
  highlight,
  description,
  price,
  priceSuffix,
  features,
  onSelect,
  selectLabel,
}: {
  icon: ReactNode;
  name: string;
  badgeLabel?: string;
  highlight?: boolean;
  description: string;
  price: string;
  priceSuffix?: string;
  features: string[];
  onSelect?: () => void;
  selectLabel?: string;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-4 ${
        highlight ? "border-income shadow-md" : "border-gray-200 dark:border-gray-800"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-income-light text-base">{icon}</span>
        {badgeLabel && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              highlight ? "bg-income text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {badgeLabel}
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold">{name}</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
      <p className="mt-3 text-2xl font-bold">
        {price}
        {priceSuffix && <span className="text-sm font-normal text-gray-400"> {priceSuffix}</span>}
      </p>
      <ul className="mt-3 flex-1 space-y-1.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-gray-600 dark:text-gray-300">
            <span className="mt-0.5 text-income">✓</span>
            {f}
          </li>
        ))}
      </ul>
      {onSelect && (
        <Button variant={highlight ? "income" : "dashboard"} outline={!highlight} className="mt-4 w-full" onClick={onSelect}>
          {selectLabel}
        </Button>
      )}
    </div>
  );
}
