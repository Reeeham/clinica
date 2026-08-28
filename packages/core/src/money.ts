import type { Locale, Piastres } from "./types";

/** Clinica's commission on payments collected through the client mobile app. */
export const PLATFORM_FEE_RATE = 0.02;

/** Build piastres from EGP. `egp(1500)` → 150000 */
export function egp(amount: number): Piastres {
  return Math.round(amount * 100);
}

export function toEgp(value: Piastres): number {
  return value / 100;
}

export function platformFee(amount: Piastres): Piastres {
  return Math.round(amount * PLATFORM_FEE_RATE);
}

export function sum(values: Piastres[]): Piastres {
  return values.reduce((a, b) => a + b, 0);
}

export interface MoneyOptions {
  locale?: Locale;
  /** Show piastres. Off by default — Egyptian clinics price in whole pounds. */
  decimals?: boolean;
  /** "EGP 1,500" vs "1,500" */
  symbol?: boolean;
  /** 1,500,000 → 1.5M */
  compact?: boolean;
}

const LOCALE_TAG: Record<Locale, string> = { en: "en-EG", ar: "ar-EG" };

export function formatMoney(value: Piastres, options: MoneyOptions = {}): string {
  const { locale = "en", decimals = false, symbol = true, compact = false } = options;
  const amount = toEgp(value);
  const fractionDigits = decimals ? 2 : 0;

  const formatted = new Intl.NumberFormat(LOCALE_TAG[locale], {
    minimumFractionDigits: compact ? 0 : fractionDigits,
    maximumFractionDigits: compact ? 1 : fractionDigits,
    notation: compact && Math.abs(amount) >= 10_000 ? "compact" : "standard",
  }).format(amount);

  if (!symbol) return formatted;
  return locale === "ar" ? `${formatted} ج.م` : `EGP ${formatted}`;
}

export function formatNumber(value: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale]).format(value);
}

export function formatPercent(value: number, locale: Locale = "en", digits = 0): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
