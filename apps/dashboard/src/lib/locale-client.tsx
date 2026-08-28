"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { dirOf, translatorFor, type Locale, type Translator } from "./i18n";

interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Translator;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  dir: "ltr",
  t: translatorFor("en"),
});

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, dir: dirOf(locale), t: translatorFor(locale) }),
    [locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
