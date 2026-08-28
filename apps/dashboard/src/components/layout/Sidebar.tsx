"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  Sparkles,
  Stethoscope,
  Users,
  Wallet,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/locale-client";
import type { DictKey } from "@/lib/i18n";

interface NavItem {
  href: string;
  key: DictKey;
  icon: LucideIcon;
}

const NAV: { group: DictKey; items: NavItem[] }[] = [
  {
    group: "nav.group.today",
    items: [
      { href: "/", key: "nav.overview", icon: LayoutDashboard },
      { href: "/schedule", key: "nav.schedule", icon: CalendarDays },
      { href: "/bookings", key: "nav.bookings", icon: ClipboardList },
    ],
  },
  {
    group: "nav.group.clients",
    items: [
      { href: "/customers", key: "nav.customers", icon: Users },
      { href: "/sessions", key: "nav.sessions", icon: ClipboardCheck },
      { href: "/team", key: "nav.team", icon: Stethoscope },
    ],
  },
  {
    group: "nav.group.business",
    items: [
      { href: "/catalog", key: "nav.catalog", icon: Sparkles },
      { href: "/billing", key: "nav.billing", icon: Wallet },
      { href: "/settings", key: "nav.settings", icon: Settings2 },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  clinicName,
  clinicArea,
  plan,
  onNavigate,
  mobile = false,
}: {
  clinicName: string;
  clinicArea: string;
  plan: string;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useLocale();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (mobile) return;
    setCollapsed(window.localStorage.getItem("clinica.sidebar") === "collapsed");
  }, [mobile]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    window.localStorage.setItem("clinica.sidebar", next ? "collapsed" : "open");
  };

  const narrow = collapsed && !mobile;

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-e border-line bg-surface transition-[width] duration-200",
        narrow ? "w-[4.75rem]" : "w-[16rem]",
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-line",
          narrow ? "h-16 justify-center px-0" : "h-16 justify-between px-4",
        )}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2.5" onClick={onNavigate}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand text-white shadow-xs">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              <path
                d="M12 21s-7.5-4.7-7.5-10.1A4.9 4.9 0 0 1 12 7.6a4.9 4.9 0 0 1 7.5 3.3C19.5 16.3 12 21 12 21Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M12 3.2v3.2M10.4 4.8h3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          {!narrow ? (
            <span className="min-w-0">
              <span className="block truncate font-display text-[1.05rem] leading-none tracking-[-0.01em]">
                {t("app.name")}
              </span>
              <span className="mt-1 block truncate text-2xs uppercase tracking-[0.08em] text-ink-4">
                {t("app.suite")}
              </span>
            </span>
          ) : null}
        </Link>
        {!mobile && !narrow ? (
          <button
            type="button"
            onClick={toggle}
            title={t("nav.collapse")}
            aria-label={t("nav.collapse")}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-ink/[0.045] hover:text-ink"
          >
            <PanelLeftClose className="h-4 w-4 rtl:rotate-180" strokeWidth={1.8} />
          </button>
        ) : null}
      </div>

      {!mobile && narrow ? (
        <div className="flex justify-center border-b border-line py-2">
          <button
            type="button"
            onClick={toggle}
            title={t("nav.expand")}
            aria-label={t("nav.expand")}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-ink/[0.045] hover:text-ink"
          >
            <PanelLeftOpen className="h-4 w-4 rtl:rotate-180" strokeWidth={1.8} />
          </button>
        </div>
      ) : null}

      {!narrow ? (
        <div className="mx-3 mt-3 rounded-lg border border-line bg-raised p-3">
          <p className="truncate text-[0.8125rem] font-semibold text-ink">{clinicName}</p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink-3">
            {clinicArea}
            <span className="h-1 w-1 rounded-full bg-ink-4" />
            <span className="capitalize text-gold">{plan}</span>
          </p>
        </div>
      ) : null}

      <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((section) => (
          <div key={section.group} className="mb-4 last:mb-0">
            {!narrow ? (
              <p className="mb-1.5 px-2 text-2xs font-semibold uppercase tracking-[0.08em] text-ink-4">
                {t(section.group)}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={narrow ? t(item.key) : undefined}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg text-[0.8125rem] font-medium transition-colors",
                        narrow ? "h-10 justify-center" : "h-9 px-2.5",
                        active
                          ? "bg-brand-soft text-brand-ink"
                          : "text-ink-2 hover:bg-ink/[0.045] hover:text-ink",
                      )}
                    >
                      {active ? (
                        <span className="absolute -start-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-e-full bg-brand" />
                      ) : null}
                      <Icon
                        className={cn(
                          "h-[1.15rem] w-[1.15rem] shrink-0",
                          active ? "text-brand" : "text-ink-3 group-hover:text-ink-2",
                        )}
                        strokeWidth={1.8}
                      />
                      {!narrow ? <span className="truncate">{t(item.key)}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
