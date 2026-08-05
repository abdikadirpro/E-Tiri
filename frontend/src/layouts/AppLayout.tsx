import { Outlet } from "react-router-dom";
import { BottomNav } from "../components/nav/BottomNav";
import { FabQuickActions } from "../components/nav/FabQuickActions";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export function AppLayout() {
  const { business } = useAuth();

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <img src={logo} alt="e-Tiri" className="h-9 w-9 rounded-lg object-contain" />
          <span className="text-sm text-gray-500 dark:text-gray-400">{business?.name}</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-4">
        <Outlet />
      </main>
      <FabQuickActions />
      <BottomNav />
    </div>
  );
}
