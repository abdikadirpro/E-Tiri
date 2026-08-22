import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { Button, LockIcon, Modal } from "../ui";
import type { TranslationKey } from "../../i18n";

interface NavItem {
  to: string;
  key: TranslationKey;
  icon: string;
  end?: boolean;
  matchTab?: string;
  premium?: boolean;
  locked?: boolean;
}

const items: NavItem[] = [
  { to: "/", key: "dashboard.title", icon: "🏠", end: true },
  { to: "/inventory", key: "inventory.title", icon: "📦", premium: true, locked: true },
  { to: "/transactions?tab=sales", key: "sales.title", icon: "🛒", matchTab: "sales" },
  { to: "/transactions?tab=income", key: "income.title", icon: "➕", matchTab: "income" },
  { to: "/transactions?tab=expense", key: "expense.title", icon: "➖", matchTab: "expense" },
  { to: "/debts", key: "debts.title", icon: "💳", premium: true, locked: true },
  { to: "/customers", key: "customers.title", icon: "👥" },
  { to: "/suppliers", key: "suppliers.title", icon: "🏭" },
  { to: "/reports", key: "reports.title", icon: "📊", premium: true, locked: true },
  { to: "/settings", key: "settings.title", icon: "⚙️", premium: true },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = new URLSearchParams(location.search).get("tab") ?? "income";
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [step, setStep] = useState<"locked" | "upgrade">("locked");

  function openLockedModal() {
    setStep("locked");
    setLockedModalOpen(true);
  }

  function goToDashboard() {
    setLockedModalOpen(false);
    navigate("/");
    onNavigate?.();
  }

  return (
    <nav className="flex h-full w-60 flex-col overflow-y-auto bg-dashboard py-4 text-white">
      <ul className="space-y-1 px-3">
        {items.map((item) => {
          const isTransactionsPath = location.pathname === "/transactions";
          const active = item.matchTab
            ? isTransactionsPath && currentTab === item.matchTab
            : undefined;

          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={(e) => {
                  if (item.locked) {
                    e.preventDefault();
                    openLockedModal();
                    return;
                  }
                  onNavigate?.();
                }}
                className={({ isActive }) => {
                  const isCurrent = item.matchTab ? active : isActive;
                  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isCurrent ? "bg-white/20" : "hover:bg-white/10 text-white/85"
                  }`;
                }}
              >
                <span className="text-base">{item.icon}</span>
                <span className="flex-1">{t(item.key)}</span>
                {item.premium && (
                  <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                    <LockIcon className="h-2.5 w-2.5" />
                    {t("upgrade.premiumBadge")}
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <Modal
        open={lockedModalOpen}
        onClose={() => setLockedModalOpen(false)}
        title={step === "locked" ? t("upgrade.featureLockedTitle") : t("upgrade.title")}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-income-light text-income">
          <LockIcon className="h-7 w-7" />
        </div>
        {step === "locked" ? (
          <>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300">{t("upgrade.featureLockedMessage")}</p>
            <div className="mt-4 space-y-2">
              <Button className="w-full" onClick={() => setStep("upgrade")}>
                {t("upgrade.upgradeToPro")}
              </Button>
              <button
                onClick={goToDashboard}
                className="w-full text-center text-sm text-gray-500 hover:underline dark:text-gray-400"
              >
                {t("upgrade.goToDashboard")}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300">{t("upgrade.message")}</p>
            <Button className="mt-4 w-full" onClick={() => setLockedModalOpen(false)}>
              {t("common.cancel")}
            </Button>
          </>
        )}
      </Modal>
    </nav>
  );
}
