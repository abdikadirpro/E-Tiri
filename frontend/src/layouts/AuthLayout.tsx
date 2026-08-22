import { ReactNode } from "react";
import { useLanguage } from "../context/LanguageContext";
import logo from "../assets/logo.png";

export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dashboard-light via-white to-white px-4 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <img src={logo} alt="e-Tiri" className="mx-auto h-24 w-24 rounded-2xl object-contain shadow-lg shadow-dashboard/10" />
          <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t("app.slogan")}</p>
        </div>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          {children}
        </div>
      </div>
    </div>
  );
}
