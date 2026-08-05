import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "../api/endpoints";
import type { Business, User } from "../types";
import { useLanguage } from "./LanguageContext";

interface AuthContextValue {
  user: User | null;
  business: Business | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setBusiness: (business: Business) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusinessState] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const { setLang } = useLanguage();

  useEffect(() => {
    authApi
      .me()
      .then(({ user, business }) => {
        setUser(user);
        setBusinessState(business);
        setLang(business.language.toLowerCase() as "so" | "en");
      })
      .catch(() => {
        setUser(null);
        setBusinessState(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const { user, business } = await authApi.login({ email, password });
    setUser(user);
    setBusinessState(business);
    setLang(business.language.toLowerCase() as "so" | "en");
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
    setBusinessState(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, business, loading, login, logout, setBusiness: setBusinessState }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
