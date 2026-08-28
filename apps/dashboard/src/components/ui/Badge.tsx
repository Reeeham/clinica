import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone =
  | "neutral"
  | "brand"
  | "success"
  | "warn"
  | "danger"
  | "info"
  | "gold"
  | "muted";

const TONES: Record<Tone, string> = {
  neutral: "bg-ink/[0.055] text-ink-2 ring-ink/[0.06]",
  brand: "bg-brand-soft text-brand-ink ring-brand-line",
  success: "bg-success-soft text-success ring-success-line",
  warn: "bg-warn-soft text-warn ring-warn-line",
  danger: "bg-danger-soft text-danger ring-danger-line",
  info: "bg-info-soft text-info ring-info-line",
  gold: "bg-gold-soft text-gold ring-gold-line",
  muted: "bg-transparent text-ink-3 ring-line-strong",
};

const DOTS: Record<Tone, string> = {
  neutral: "bg-ink-3",
  brand: "bg-brand",
  success: "bg-success",
  warn: "bg-warn",
  danger: "bg-danger",
  info: "bg-info",
  gold: "bg-gold",
  muted: "bg-ink-4",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
  pulse = false,
  className,
  size = "md",
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md font-medium ring-1 ring-inset",
        size === "sm" ? "px-1.5 py-0.5 text-2xs" : "px-2 py-1 text-xs",
        TONES[tone],
        className,
      )}
    >
      {dot ? (
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            DOTS[tone],
            pulse && "animate-pulse-soft",
          )}
        />
      ) : null}
      {children}
    </span>
  );
}

export function Dot({ tone = "neutral", className }: { tone?: Tone; className?: string }) {
  return <span className={cn("h-2 w-2 rounded-full", DOTS[tone], className)} />;
}
