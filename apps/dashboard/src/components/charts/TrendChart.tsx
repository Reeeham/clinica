"use client";

import { useMemo, useState } from "react";
import { formatDate, formatMoney, type Locale } from "@clinica/core";
import { cn } from "@/lib/cn";

export interface TrendPoint {
  date: string;
  value: number;
  secondary: number;
}

/**
 * Revenue trend. The filled area is total collected; the darker line is the
 * share collected through the client app — the number owners care about most.
 */
export function TrendChart({
  points,
  locale,
  height = 208,
}: {
  points: TrendPoint[];
  locale: Locale;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 720;
  const padTop = 16;
  const padBottom = 26;
  const inner = height - padTop - padBottom;

  const { max, totalPath, totalArea, appPath, step, ticks } = useMemo(() => {
    const peak = Math.max(...points.map((p) => p.value), 1);
    const rounded = Math.ceil(peak / 50000) * 50000 || peak;
    const stepX = points.length > 1 ? width / (points.length - 1) : width;
    const y = (value: number) => padTop + inner - (value / rounded) * inner;

    const total = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${(i * stepX).toFixed(1)},${y(p.value).toFixed(1)}`)
      .join(" ");
    const app = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${(i * stepX).toFixed(1)},${y(p.secondary).toFixed(1)}`)
      .join(" ");

    return {
      max: rounded,
      totalPath: total,
      totalArea: `${total} L${width},${padTop + inner} L0,${padTop + inner} Z`,
      appPath: app,
      step: stepX,
      ticks: [0, 0.5, 1].map((ratio) => ({
        y: padTop + inner - ratio * inner,
        value: rounded * ratio,
      })),
    };
  }, [points, inner]);

  const active = hover === null ? null : points[hover];

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-5 px-1 text-xs text-ink-3">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand" />
          {locale === "ar" ? "إجمالي التحصيل" : "Total collected"}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gold" />
          {locale === "ar" ? "عبر التطبيق" : "Via app"}
        </span>
      </div>

      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7A2F5F" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#7A2F5F" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => (
            <line
              key={tick.y}
              x1={0}
              x2={width}
              y1={tick.y}
              y2={tick.y}
              stroke="#EBE3DF"
              strokeWidth="1"
              strokeDasharray={tick.value === 0 ? undefined : "3 5"}
            />
          ))}

          <path d={totalArea} fill="url(#trend-fill)" />
          <path
            d={totalPath}
            fill="none"
            stroke="#7A2F5F"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={appPath}
            fill="none"
            stroke="#B0813F"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {active ? (
            <line
              x1={(hover as number) * step}
              x2={(hover as number) * step}
              y1={padTop - 6}
              y2={padTop + inner}
              stroke="#7A2F5F"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          {points.map((point, index) => (
            <rect
              key={point.date}
              x={index * step - step / 2}
              y={0}
              width={step}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHover(index)}
            />
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-y-0 -start-1 flex flex-col justify-between pb-7 pt-2 text-2xs tabular-nums text-ink-4">
          <span>{formatMoney(max, { locale, symbol: false, compact: true })}</span>
          <span>{formatMoney(max / 2, { locale, symbol: false, compact: true })}</span>
          <span>0</span>
        </div>
      </div>

      <div className="mt-1 flex justify-between px-1 text-2xs text-ink-4">
        {points.length > 0 ? (
          <>
            <span>{formatDate(points[0]?.date ?? "", locale)}</span>
            <span>{formatDate(points[Math.floor(points.length / 2)]?.date ?? "", locale)}</span>
            <span>{formatDate(points[points.length - 1]?.date ?? "", locale)}</span>
          </>
        ) : null}
      </div>

      {active ? (
        <div
          className={cn(
            "pointer-events-none absolute top-8 z-10 w-44 rounded-lg border border-line bg-surface p-3 shadow-pop",
          )}
          style={{
            insetInlineStart: `calc(${((hover as number) / Math.max(1, points.length - 1)) * 100}% - 88px)`,
          }}
        >
          <p className="text-2xs uppercase tracking-wide text-ink-4">
            {formatDate(active.date, locale)}
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {formatMoney(active.value, { locale })}
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-gold">
            {formatMoney(active.secondary, { locale })} · {locale === "ar" ? "التطبيق" : "app"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
