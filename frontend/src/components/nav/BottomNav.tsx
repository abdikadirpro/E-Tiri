import { NavLink } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const items = [
  { to: "/", key: "nav.home" as const, icon: "🏠" },
  { to: "/transactions", key: "nav.transactions" as const, icon: "💰" },
  { to: "/reports", key: "nav.reports" as const, icon: "📊" },
  { to: "/inventory", key: "nav.inventory" as const, icon: "📦" },
  { to: "/settings", key: "nav.settings" as const, icon: "⚙️" },
];

export function BottomNav() {
  const { t } = useLanguage();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      <ul className="mx-auto flex max-w-3xl items-center justify-between px-2">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                  isActive ? "text-dashboard" : "text-gray-400 dark:text-gray-500"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {t(item.key)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
