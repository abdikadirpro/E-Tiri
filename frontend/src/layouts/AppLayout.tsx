import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/nav/Sidebar";
import { QuickActionsMenu } from "../components/nav/QuickActionsMenu";
import { UserMenu } from "../components/nav/UserMenu";
import { UpgradeButton } from "../components/nav/UpgradeButton";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export function AppLayout() {
  const { business } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <button
              className="text-xl text-gray-500 md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <img src={logo} alt="e-Tiri" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{business?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <UpgradeButton />
            <QuickActionsMenu />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
