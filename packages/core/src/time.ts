import type { ISODate, Locale } from "./types";

/**
 * All datetimes in Clinica are stored as naive clinic wall-clock strings
 * ("2026-08-25T14:30"). Parsing them into local `Date` components and
 * formatting them back in the same local zone is timezone-invariant, which
 * keeps server-rendered and client-rendered output identical.
 */

const LOCALE_TAG: Record<Locale, string> = { en: "en-GB", ar: "ar-EG" };

export function parseISO(value: ISODate): Date {
  if (!value || typeof value !== "string" || value.length < 10) {
    return new Date(NaN);
  }
  const [datePart, timePart = "00:00"] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toISODate(date: Date): ISODate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toISODateTime(date: Date): ISODate {
  return `${toISODate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Weeks in Egypt start on Saturday. */
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const diff = (d.getDay() + 1) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((parseISO(a).getTime() - parseISO(b).getTime()) / 86_400_000);
}

export function isSameDay(a: ISODate, b: ISODate): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

export function isWithin(value: ISODate, from: ISODate, to: ISODate): boolean {
  const t = parseISO(value).getTime();
  return t >= parseISO(from).getTime() && t <= parseISO(to).getTime();
}

/** Deterministic per calendar day, so SSR and CSR agree. */
export function today(): Date {
  return startOfDay(new Date());
}

export function todayISO(): ISODate {
  return toISODate(today());
}

/* --------------------------------------------------------------- formatting */

export function formatTime(value: ISODate, locale: Locale = "en"): string {
  const date = parseISO(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatDate(value: ISODate, locale: Locale = "en"): string {
  const date = parseISO(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateLong(value: ISODate, locale: Locale = "en"): string {
  const date = parseISO(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDayShort(value: ISODate, locale: Locale = "en"): string {
  const date = parseISO(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], { weekday: "short" }).format(date);
}

export function formatMonthYear(value: ISODate, locale: Locale = "en"): string {
  const date = parseISO(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], { month: "long", year: "numeric" }).format(
    date,
  );
}

export function formatDuration(minutes: number, locale: Locale = "en"): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (locale === "ar") {
    if (h && m) return `${h} س ${m} د`;
    if (h) return `${h} س`;
    return `${m} د`;
  }
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m} min`;
}

/** "in 3 days" / "2 weeks ago" relative to today. */
export function formatRelativeDay(value: ISODate, locale: Locale = "en"): string {
  const days = diffDays(value.slice(0, 10), todayISO());
  const rtf = new Intl.RelativeTimeFormat(LOCALE_TAG[locale], { numeric: "auto" });
  if (Math.abs(days) < 31) return rtf.format(days, "day");
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), "month");
  return rtf.format(Math.round(days / 365), "year");
}

export function age(birthDate: ISODate | null): number | null {
  if (!birthDate) return null;
  const b = parseISO(birthDate);
  const now = today();
  let years = now.getFullYear() - b.getFullYear();
  const before =
    now.getMonth() < b.getMonth() ||
    (now.getMonth() === b.getMonth() && now.getDate() < b.getDate());
  if (before) years -= 1;
  return years;
}

/** Egyptian mobile numbers: 01X XXXX XXXX */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("01")) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  }
  return phone;
}
