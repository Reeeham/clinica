import { cn } from "@/lib/cn";
import type { Tone } from "./Badge";

const FILLS: Record<Tone, string> = {
  neutral: "bg-ink-3",
  brand: "bg-brand",
  success: "bg-success",
  warn: "bg-warn",
  danger: "bg-danger",
  info: "bg-info",
  gold: "bg-gold",
  muted: "bg-ink-4",
};

export function Progress({
  value,
  tone = "brand",
  className,
  height = "h-1.5",
}: {
  value: number;
  tone?: Tone;
  className?: string;
  height?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-line", height, className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", FILLS[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Segmented progress — one tick per session, so staff can count at a glance. */
export function SessionPips({
  used,
  total,
  tone = "brand",
}: {
  used: number;
  total: number;
  tone?: Tone;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 w-4 rounded-full",
            index < used ? FILLS[tone] : "bg-line",
          )}
        />
      ))}
    </div>
  );
}

export function Ring({
  value,
  size = 44,
  stroke = 5,
  label,
  tone = "brand",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  tone?: Tone;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value));
  const colors: Record<Tone, string> = {
    neutral: "#7C6B75",
    brand: "#7A2F5F",
    success: "#1B7A5A",
    warn: "#A96E0C",
    danger: "#AC2B22",
    info: "#2A5EA6",
    gold: "#B0813F",
    muted: "#A99CA3",
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EBE3DF"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
        />
      </svg>
      {label ? (
        <span className="absolute text-[0.6875rem] font-semibold tabular-nums text-ink">
          {label}
        </span>
      ) : null}
    </div>
  );
}
