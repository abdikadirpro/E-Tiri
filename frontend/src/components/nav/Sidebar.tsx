import { NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import type { TranslationKey } from "../../i18n";

interface NavItem {
  to: string;
  key: TranslationKey;
  icon: string;
  end?: boolean;
  matchTab?: string;
}

const items: NavItem[] = [
  { to: "/", key: "dashboard.title", icon: "🏠", end: true },
  { to: "/inventory", key: "inventory.title", icon: "📦" },
  { to: "/transactions?tab=sales", key: "sales.title", icon: "🛒", matchTab: "sales" },
  { to: "/transactions?tab=income", key: "income.title", icon: "➕", matchTab: "income" },
  { to: "/transactions?tab=expense", key: "expense.title", icon: "➖", matchTab: "expense" },
  { to: "/debts", key: "debts.title", icon: "💳" },
  { to: "/customers", key: "customers.title", icon: "👥" },
  { to: "/suppliers", key: "suppliers.title", icon: "🏭" },
  { to: "/reports", key: "reports.title", icon: "📊" },
  { to: "/settings", key: "settings.title", icon: "⚙️" },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLanguage();
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get("tab") ?? "income";

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
                onClick={onNavigate}
                className={({ isActive }) => {
                  const isCurrent = item.matchTab ? active : isActive;
                  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isCurrent ? "bg-white/20" : "hover:bg-white/10 text-white/85"
                  }`;
                }}
              >
                <span className="text-base">{item.icon}</span>
                {t(item.key)}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
