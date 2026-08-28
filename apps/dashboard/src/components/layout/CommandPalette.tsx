"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  CornerDownLeft,
  LayoutDashboard,
  Search,
  Settings2,
  Sparkles,
  Stethoscope,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/locale-client";
import type { DictKey } from "@/lib/i18n";

export interface PaletteItem {
  kind: "customer" | "employee" | "service" | "package" | "page";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

const PAGES: { key: DictKey; href: string; icon: typeof Search }[] = [
  { key: "nav.overview", href: "/", icon: LayoutDashboard },
  { key: "nav.schedule", href: "/schedule", icon: CalendarDays },
  { key: "nav.bookings", href: "/bookings", icon: ClipboardList },
  { key: "nav.customers", href: "/customers", icon: Users },
  { key: "nav.team", href: "/team", icon: Stethoscope },
  { key: "nav.catalog", href: "/catalog", icon: Sparkles },
  { key: "nav.billing", href: "/billing", icon: Wallet },
  { key: "nav.settings", href: "/settings", icon: Settings2 },
];

const GROUP_LABEL: Record<PaletteItem["kind"], DictKey> = {
  page: "palette.pages",
  customer: "palette.customers",
  employee: "palette.team",
  service: "palette.services",
  package: "palette.packages",
};

export function CommandPalette({
  items,
  open,
  onOpenChange,
}: {
  items: PaletteItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const pageItems = useMemo<PaletteItem[]>(
    () =>
      PAGES.map((page) => ({
        kind: "page" as const,
        id: page.href,
        title: t(page.key),
        subtitle: page.href,
        href: page.href,
      })),
    [t],
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const pool = [...pageItems, ...items];
    if (!term) return pool.filter((item) => item.kind === "page");
    return pool
      .filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(term))
      .slice(0, 24);
  }, [query, items, pageItems]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setCursor(0);
      return;
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (event.key === "Escape" && open) onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const go = (item: PaletteItem) => {
    onOpenChange(false);
    router.push(item.href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    }
    if (event.key === "Enter" && results[cursor]) {
      event.preventDefault();
      go(results[cursor]);
    }
  };

  let lastKind: string | null = null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <div
        className="absolute inset-0 animate-fade-in bg-ink/30 backdrop-blur-[3px]"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("palette.title")}
        className="relative z-10 w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-line bg-surface shadow-overlay"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-ink-4" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("palette.hint")}
            className="h-13 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-4"
          />
          <kbd className="hidden shrink-0 rounded border border-line bg-raised px-1.5 py-0.5 text-2xs text-ink-4 sm:block">
            ESC
          </kbd>
        </div>

        <div className="scroll-thin max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink-3">{t("palette.empty")}</p>
          ) : (
            results.map((item, index) => {
              const showGroup = item.kind !== lastKind;
              lastKind = item.kind;
              const selected = index === cursor;
              return (
                <div key={`${item.kind}-${item.id}`}>
                  {showGroup ? (
                    <p className="px-3 pb-1 pt-3 text-2xs font-semibold uppercase tracking-[0.08em] text-ink-4">
                      {t(GROUP_LABEL[item.kind])}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => go(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start transition-colors",
                      selected ? "bg-brand-soft" : "hover:bg-ink/[0.04]",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8125rem] font-medium text-ink">
                        {item.title}
                      </span>
                      <span className="block truncate text-xs text-ink-3">{item.subtitle}</span>
                    </span>
                    {selected ? (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-brand" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-4 rtl:rotate-180" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
