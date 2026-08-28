import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Sparkline } from "./Sparkline";

export function Stat({
  label,
  value,
  delta,
  deltaLabel,
  hint,
  trend,
  tone = "brand",
  invert = false,
  icon,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  hint?: ReactNode;
  trend?: number[];
  tone?: "brand" | "gold" | "success" | "info";
  /** For metrics where down is good (no-shows). */
  invert?: boolean;
  icon?: ReactNode;
}) {
  const colors = {
    brand: "#7A2F5F",
    gold: "#B0813F",
    success: "#1B7A5A",
    info: "#2A5EA6",
  } as const;

  const good = delta === undefined ? null : invert ? delta <= 0 : delta >= 0;
  const flat = delta !== undefined && Math.abs(delta) < 0.005;

  return (
    <div className="group relative flex flex-col justify-between gap-4 rounded-xl border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-raise">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8125rem] font-medium leading-snug text-ink-3">{label}</p>
        {icon ? <span className="text-ink-4">{icon}</span> : null}
      </div>

      <div>
        <p className="font-display text-[1.6rem] leading-none tracking-[-0.01em] tabular-nums text-ink">
          {value}
        </p>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          {delta !== undefined ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
                flat
                  ? "bg-ink/[0.05] text-ink-3"
                  : good
                    ? "bg-success-soft text-success"
                    : "bg-danger-soft text-danger",
              )}
            >
              {flat ? (
                <Minus className="h-3 w-3" />
              ) : delta > 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(delta * 100).toFixed(delta === 0 ? 0 : Math.abs(delta) < 0.1 ? 1 : 0)}%
            </span>
          ) : (
            <span className="text-xs text-ink-4">{deltaLabel}</span>
          )}
          {trend && trend.length > 2 ? (
            <Sparkline values={trend} tone={colors[tone]} width={72} height={24} />
          ) : null}
        </div>

        {hint ? <p className="mt-2 text-xs leading-snug text-ink-4">{hint}</p> : null}
      </div>
    </div>
  );
}
