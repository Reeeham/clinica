import Link from "next/link";
import { cn } from "@/lib/cn";

export interface TabItem {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}

/** URL-driven tabs — every view stays shareable and bookmarkable. */
export function TabLinks({ items, className }: { items: TabItem[]; className?: string }) {
  return (
    <nav className={cn("flex items-center gap-1 overflow-x-auto scroll-thin", className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "group relative inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-[0.8125rem] font-medium transition-colors",
            item.active
              ? "bg-brand-soft text-brand-ink"
              : "text-ink-3 hover:bg-ink/[0.04] hover:text-ink",
          )}
        >
          {item.label}
          {item.count !== undefined ? (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-2xs tabular-nums",
                item.active ? "bg-white/70 text-brand-ink" : "bg-ink/[0.06] text-ink-3",
              )}
            >
              {item.count}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}

/** Underlined variant used for entity detail pages. */
export function TabRail({ items, className }: { items: TabItem[]; className?: string }) {
  return (
    <nav
      className={cn(
        "scroll-thin -mb-px flex items-center gap-6 overflow-x-auto border-b border-line",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "relative whitespace-nowrap border-b-2 pb-3 pt-1 text-[0.8125rem] font-medium transition-colors",
            item.active
              ? "border-brand text-ink"
              : "border-transparent text-ink-3 hover:border-line-strong hover:text-ink",
          )}
        >
          {item.label}
          {item.count !== undefined ? (
            <span className="ms-2 rounded bg-ink/[0.06] px-1.5 py-0.5 text-2xs tabular-nums text-ink-3">
              {item.count}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}

export function Segmented({ items, className }: { items: TabItem[]; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-line bg-raised p-0.5",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
            item.active
              ? "bg-surface text-ink shadow-xs"
              : "text-ink-3 hover:text-ink",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
