import { ReactNode } from "react";
import { useLanguage } from "../context/LanguageContext";
import logo from "../assets/logo.png";

export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dashboard-light to-white px-4 dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <img src={logo} alt="e-Tiri" className="mx-auto h-28 w-28 rounded-2xl object-contain" />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("app.slogan")}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {children}
        </div>
      </div>
    </div>
  );
}
