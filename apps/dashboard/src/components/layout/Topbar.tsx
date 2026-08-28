"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Globe,
  HelpCircle,
  LogOut,
  Menu,
  Plus,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { setLocale } from "@/lib/actions";
import { logoutAction } from "@/lib/auth-actions";
import { useLocale } from "@/lib/locale-client";
import { Avatar } from "@/components/ui/Avatar";
import { Button, buttonClass } from "@/components/ui/Button";
import { Sidebar } from "./Sidebar";
import { CommandPalette, type PaletteItem } from "./CommandPalette";

export interface TopbarUser {
  name: string;
  role: string;
  initials: string;
  color: string;
}

export function Topbar({
  user,
  clinicName,
  clinicArea,
  plan,
  paletteItems,
  dateLabel,
  alerts,
}: {
  user: TopbarUser;
  clinicName: string;
  clinicArea: string;
  plan: string;
  paletteItems: PaletteItem[];
  dateLabel: string;
  alerts: { title: string; hint: string; href: string }[];
}) {
  const { t, locale } = useLocale();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menu, setMenu] = useState<"none" | "account" | "alerts" | "lang">("none");
  const [mobileNav, setMobileNav] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setMenu("none");
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const switchTo = (next: "en" | "ar") => {
    setMenu("none");
    startTransition(() => {
      void setLocale(next);
    });
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md lg:px-6">
        <Button
          variant="ghost"
          size="sm"
          icon
          className="lg:hidden"
          aria-label={t("nav.expand")}
          onClick={() => setMobileNav(true)}
        >
          <Menu className="h-4.5 w-4.5" />
        </Button>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="group flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-line bg-raised px-3 text-start text-[0.8125rem] text-ink-4 transition-colors hover:border-line-strong hover:bg-surface sm:max-w-md"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">{t("common.searchAll")}</span>
          <kbd className="ms-auto hidden shrink-0 items-center gap-0.5 rounded border border-line bg-surface px-1.5 py-0.5 font-sans text-2xs text-ink-4 sm:flex">
            ⌘K
          </kbd>
        </button>

        <span className="ms-auto hidden text-[0.8125rem] text-ink-3 xl:block">{dateLabel}</span>

        <div ref={wrap} className="flex items-center gap-1.5">
          <Link href="/bookings?new=1" className={buttonClass({ variant: "primary", size: "sm" })}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("action.newBooking")}</span>
          </Link>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              icon
              aria-label={t("topbar.notifications")}
              onClick={() => setMenu(menu === "alerts" ? "none" : "alerts")}
            >
              <Bell className="h-4.5 w-4.5" />
              {alerts.length ? (
                <span className="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger ring-2 ring-surface" />
              ) : null}
            </Button>
            {menu === "alerts" ? (
              <div className="absolute end-0 top-11 z-40 w-80 animate-scale-in overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
                <p className="border-b border-line px-4 py-3 text-[0.8125rem] font-semibold">
                  {t("topbar.notifications")}
                </p>
                <ul className="divide-y divide-line">
                  {alerts.map((alert) => (
                    <li key={alert.title}>
                      <Link
                        href={alert.href}
                        onClick={() => setMenu("none")}
                        className="block px-4 py-3 transition-colors hover:bg-brand-softer"
                      >
                        <p className="text-[0.8125rem] font-medium text-ink">{alert.title}</p>
                        <p className="mt-0.5 text-xs text-ink-3">{alert.hint}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              icon
              aria-label={t("topbar.language")}
              onClick={() => setMenu(menu === "lang" ? "none" : "lang")}
              disabled={pending}
            >
              <Globe className="h-4.5 w-4.5" />
            </Button>
            {menu === "lang" ? (
              <div className="absolute end-0 top-11 z-40 w-44 animate-scale-in overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-pop">
                {(["en", "ar"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => switchTo(code)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[0.8125rem] transition-colors",
                      locale === code ? "bg-brand-soft text-brand-ink" : "hover:bg-ink/[0.04]",
                    )}
                  >
                    {code === "en" ? "English" : "العربية"}
                    {locale === code ? <Check className="h-3.5 w-3.5" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon
            aria-label={t("topbar.help")}
            className="hidden sm:inline-flex"
          >
            <HelpCircle className="h-4.5 w-4.5" />
          </Button>

          <div className="relative ms-1">
            <button
              type="button"
              onClick={() => setMenu(menu === "account" ? "none" : "account")}
              className="flex items-center gap-2 rounded-lg py-1 ps-1 pe-1.5 transition-colors hover:bg-ink/[0.04]"
            >
              <Avatar initials={user.initials} color={user.color} size="sm" />
              <span className="hidden min-w-0 text-start lg:block">
                <span className="block max-w-[9rem] truncate text-xs font-semibold text-ink">
                  {user.name}
                </span>
                <span className="block text-2xs text-ink-3">{user.role}</span>
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-ink-4 lg:block" />
            </button>
            {menu === "account" ? (
              <div className="absolute end-0 top-12 z-40 w-56 animate-scale-in overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
                <div className="border-b border-line px-4 py-3">
                  <p className="text-[0.8125rem] font-semibold text-ink">{user.name}</p>
                  <p className="text-xs text-ink-3">{clinicName}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/settings"
                    onClick={() => setMenu("none")}
                    className="block rounded-lg px-2.5 py-2 text-[0.8125rem] text-ink-2 transition-colors hover:bg-ink/[0.04]"
                  >
                    {t("nav.settings")}
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[0.8125rem] text-danger transition-colors hover:bg-danger-soft"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      {t("topbar.signOut")}
                    </button>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {mobileNav ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-ink/35 backdrop-blur-[2px]"
            onClick={() => setMobileNav(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 start-0 w-[17rem] animate-slide-in-end bg-surface shadow-overlay" style={{ ["--slide-from" as string]: "-24px" }}>
            <button
              type="button"
              onClick={() => setMobileNav(false)}
              aria-label={t("action.close")}
              className="absolute end-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg text-ink-3 hover:bg-ink/[0.05]"
            >
              <X className="h-4 w-4" />
            </button>
            <Sidebar
              clinicName={clinicName}
              clinicArea={clinicArea}
              plan={plan}
              mobile
              onNavigate={() => setMobileNav(false)}
            />
          </div>
        </div>
      ) : null}

      <CommandPalette items={paletteItems} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
