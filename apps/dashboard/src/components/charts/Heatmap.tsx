import type { Locale } from "@clinica/core";
import { cn } from "@/lib/cn";

const DAY_LABELS: Record<Locale, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ar: ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
};

/** Sessions per weekday/hour. Reveals when to add or cut staff. */
export function Heatmap({
  cells,
  locale,
}: {
  cells: { day: number; hour: number; count: number }[];
  locale: Locale;
}) {
  const hours = [...new Set(cells.map((c) => c.hour))].sort((a, b) => a - b);
  const days = [6, 0, 1, 2, 3, 4];
  const max = Math.max(...cells.map((c) => c.count), 1);
  const lookup = new Map(cells.map((c) => [`${c.day}-${c.hour}`, c.count]));

  const shade = (count: number) => {
    if (count === 0) return "bg-line/50";
    const ratio = count / max;
    if (ratio > 0.8) return "bg-brand";
    if (ratio > 0.6) return "bg-brand/75";
    if (ratio > 0.4) return "bg-brand/55";
    if (ratio > 0.2) return "bg-brand/35";
    return "bg-brand/18";
  };

  return (
    <div className="scroll-thin overflow-x-auto">
      <div className="min-w-[30rem]">
        <div className="flex">
          <div className="w-14 shrink-0" />
          <div className="flex flex-1 gap-1">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-1 pb-1.5 text-center text-2xs tabular-nums text-ink-4"
              >
                {hour > 12 ? hour - 12 : hour}
              </div>
            ))}
          </div>
        </div>

        {days.map((day) => (
          <div key={day} className="flex items-center">
            <div className="w-14 shrink-0 pe-2 text-end text-2xs text-ink-3">
              {DAY_LABELS[locale][day]}
            </div>
            <div className="flex flex-1 gap-1 pb-1">
              {hours.map((hour) => {
                const count = lookup.get(`${day}-${hour}`) ?? 0;
                return (
                  <div
                    key={hour}
                    title={`${DAY_LABELS[locale][day]} ${hour}:00 — ${count}`}
                    className={cn(
                      "h-6 flex-1 rounded-[4px] transition-transform hover:scale-[1.12]",
                      shade(count),
                    )}
                  />
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-3 flex items-center justify-end gap-2 text-2xs text-ink-4">
          <span>{locale === "ar" ? "أقل" : "Less"}</span>
          {["bg-line/50", "bg-brand/18", "bg-brand/35", "bg-brand/55", "bg-brand/75", "bg-brand"].map(
            (tone) => (
              <span key={tone} className={cn("h-3 w-3 rounded-[3px]", tone)} />
            ),
          )}
          <span>{locale === "ar" ? "أكثر" : "More"}</span>
        </div>
      </div>
    </div>
  );
}
