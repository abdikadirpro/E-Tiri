import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { Button, LockIcon, Modal } from "../ui";
import { UpgradeModal } from "../UpgradeModal";
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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  function goToDashboard() {
    setLockedModalOpen(false);
    navigate("/");
    onNavigate?.();
  }

  return (
    <nav className="flex h-full w-64 flex-col overflow-y-auto bg-gradient-to-b from-dashboard to-dashboard-dark py-5 text-white">
      <ul className="space-y-0.5 px-3">
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
                    setLockedModalOpen(true);
                    return;
                  }
                  onNavigate?.();
                }}
                className={({ isActive }) => {
                  const isCurrent = item.matchTab ? active : isActive;
                  return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isCurrent ? "bg-white/15 text-white shadow-sm ring-1 ring-white/10" : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`;
                }}
              >
                <span className="text-base">{item.icon}</span>
                <span className="flex-1 tracking-tight">{t(item.key)}</span>
                {item.premium && (
                  <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide ring-1 ring-white/10">
                    <LockIcon className="h-2.5 w-2.5" />
                    {t("upgrade.premiumBadge")}
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <Modal open={lockedModalOpen} onClose={() => setLockedModalOpen(false)} title={t("upgrade.featureLockedTitle")}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-income-light text-income">
          <LockIcon className="h-7 w-7" />
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-300">{t("upgrade.featureLockedMessage")}</p>
        <div className="mt-4 space-y-2">
          <Button
            className="w-full"
            onClick={() => {
              setLockedModalOpen(false);
              setUpgradeModalOpen(true);
            }}
          >
            {t("upgrade.upgradeToPro")}
          </Button>
          <button onClick={goToDashboard} className="w-full text-center text-sm text-gray-500 hover:underline dark:text-gray-400">
            {t("upgrade.goToDashboard")}
          </button>
        </div>
      </Modal>

      <UpgradeModal open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
    </nav>
  );
}
