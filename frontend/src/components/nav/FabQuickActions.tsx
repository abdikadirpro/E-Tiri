import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const actions = [
  { to: "/transactions?add=income", key: "quick.addIncome" as const, icon: "➕", variant: "income" },
  { to: "/transactions?add=expense", key: "quick.addExpense" as const, icon: "➖", variant: "expense" },
  { to: "/transactions/sales/new", key: "quick.newSale" as const, icon: "🛒", variant: "dashboard" },
  { to: "/inventory?add=product", key: "quick.newProduct" as const, icon: "📦", variant: "reports" },
  { to: "/customers?add=customer", key: "quick.newCustomer" as const, icon: "👤", variant: "dashboard" },
  { to: "/debts?add=debt", key: "quick.addDebt" as const, icon: "📒", variant: "expense" },
] as const;

const variantClasses: Record<string, string> = {
  income: "bg-income text-white",
  expense: "bg-expense text-white",
  dashboard: "bg-dashboard text-white",
  reports: "bg-reports text-white",
};

export function FabQuickActions() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  function go(to: string) {
    setOpen(false);
    navigate(to);
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col items-end gap-2">
          {actions.map((action) => (
            <button
              key={action.to}
              onClick={() => go(action.to)}
              className={`flex items-center gap-2 rounded-full py-2 pl-3 pr-4 text-sm font-medium shadow-lg ${variantClasses[action.variant]}`}
            >
              <span>{action.icon}</span>
              {t(action.key)}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-dashboard text-2xl text-white shadow-lg transition hover:bg-dashboard/90"
        aria-label="Quick actions"
      >
        {open ? "✕" : "+"}
      </button>
    </div>
  );
}
