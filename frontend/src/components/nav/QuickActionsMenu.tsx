import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import type { TranslationKey } from "../../i18n";

const actions: { to: string; key: TranslationKey; icon: string }[] = [
  { to: "/transactions?add=income", key: "quick.addIncome", icon: "➕" },
  { to: "/transactions?add=expense", key: "quick.addExpense", icon: "➖" },
  { to: "/transactions/sales/new", key: "quick.newSale", icon: "🛒" },
  { to: "/inventory?add=product", key: "quick.newProduct", icon: "📦" },
  { to: "/customers?add=customer", key: "quick.newCustomer", icon: "👤" },
  { to: "/debts?add=debt", key: "quick.addDebt", icon: "📒" },
];

export function QuickActionsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function go(to: string) {
    setOpen(false);
    navigate(to);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-lg text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Quick actions"
      >
        +
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {actions.map((action) => (
            <button
              key={action.to}
              onClick={() => go(action.to)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span>{action.icon}</span>
              {t(action.key)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
