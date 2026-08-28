import Link from "next/link";
import { cn } from "@/lib/cn";

export interface BarItem {
  id: string;
  label: string;
  meta?: string;
  value: string;
  ratio: number;
  href?: string;
  tone?: "brand" | "gold" | "info" | "success";
}

const TONES = {
  brand: "bg-brand/12",
  gold: "bg-gold/14",
  info: "bg-info/12",
  success: "bg-success/12",
} as const;

/** Ranked list with an inline bar — denser and easier to scan than a bar chart. */
export function BarList({ items }: { items: BarItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const inner = (
          <>
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-0 start-0 rounded-md transition-[width] duration-500",
                TONES[item.tone ?? "brand"],
              )}
              style={{ width: `${Math.max(2, Math.min(100, item.ratio * 100))}%` }}
            />
            <span className="relative flex min-w-0 flex-1 items-baseline gap-2">
              <span className="truncate text-[0.8125rem] font-medium text-ink">{item.label}</span>
              {item.meta ? (
                <span className="shrink-0 text-xs text-ink-4">{item.meta}</span>
              ) : null}
            </span>
            <span className="relative shrink-0 text-[0.8125rem] font-semibold tabular-nums text-ink">
              {item.value}
            </span>
          </>
        );

        return (
          <li key={item.id}>
            {item.href ? (
              <Link
                href={item.href}
                className="relative flex items-center gap-3 overflow-hidden rounded-md px-2.5 py-2 transition-colors hover:bg-ink/[0.03]"
              >
                {inner}
              </Link>
            ) : (
              <div className="relative flex items-center gap-3 overflow-hidden rounded-md px-2.5 py-2">
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
