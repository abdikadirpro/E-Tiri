import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { dictionaries, LangCode, TranslationKey } from "../i18n";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => (localStorage.getItem("e-tiri-lang") as LangCode) ?? "so");

  useEffect(() => {
    localStorage.setItem("e-tiri-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: LangCode) => setLangState(next);

  const t = useMemo(() => {
    const dict = dictionaries[lang];
    return (key: TranslationKey) => dict[key] ?? key;
  }, [lang]);

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
