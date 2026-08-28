import { cookies } from "next/headers";
import { LOCALE_COOKIE, translatorFor, type Locale, type Translator } from "./i18n";

/** Reads the dashboard language from the account cookie (server components). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "ar" ? "ar" : "en";
}

export async function getTranslator(): Promise<{ locale: Locale; t: Translator }> {
  const locale = await getLocale();
  return { locale, t: translatorFor(locale) };
}
