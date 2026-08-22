import { ReactNode, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Button, CheckIcon, LockIcon, Modal } from "./ui";
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
    <Modal
      open={open}
      onClose={close}
      size={confirmed ? "md" : "lg"}
      headerClassName={confirmed ? "" : "bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800"}
      title={
        confirmed ? (
          t("upgrade.title")
        ) : (
          <h2 className="text-center text-xl font-bold tracking-tight sm:text-2xl">{t("upgrade.choosePlan")}</h2>
        )
      }
    >
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
        <div className="pt-4">
          <div className="mb-6 flex justify-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            {(["monthly", "sixMonth", "annual"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  period === p ? "bg-white text-dashboard shadow-sm dark:bg-gray-900" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {t(`upgrade.period.${p}` as TranslationKey)}
              </button>
            ))}
          </div>

          <div className="grid gap-4 pt-3 sm:grid-cols-3">
            <PlanCard
              icon="⚡"
              iconTint="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
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
              iconTint="bg-income-light text-income"
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
              iconTint="bg-dashboard-light text-dashboard"
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
  iconTint,
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
  iconTint: string;
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
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200 dark:bg-gray-900 ${
        highlight
          ? "border-income/40 shadow-lg shadow-income/10 sm:-translate-y-2"
          : "border-gray-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800"
      }`}
    >
      {highlight && (
        <div className="bg-income py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-white">{badgeLabel}</div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${iconTint}`}>{icon}</span>
          {!highlight && badgeLabel && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {badgeLabel}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold tracking-tight">{name}</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
        <div className="mt-4">
          <span className="text-3xl font-bold tabular-nums tracking-tight">{price}</span>
          {priceSuffix && <p className="mt-0.5 text-xs font-medium text-gray-400">{priceSuffix}</p>}
        </div>
        <div className="my-4 border-t border-gray-100 dark:border-gray-800" />
        <ul className="flex-1 space-y-2.5 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
              <CheckIcon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${highlight ? "text-income" : "text-dashboard"}`} />
              {f}
            </li>
          ))}
        </ul>
        {onSelect && (
          <Button variant={highlight ? "income" : "dashboard"} outline={!highlight} className="mt-5 w-full" onClick={onSelect}>
            {selectLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
