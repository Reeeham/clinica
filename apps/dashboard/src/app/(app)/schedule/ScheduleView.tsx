"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  bookingStatusLabel,
  formatTime,
  addDays,
  formatDate,
  formatDateLong,
  parseISO,
  startOfWeek,
  toISODate,
  todayISO,
  type Locale,
  type ISODate,
} from "@clinica/core";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { L } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { bookingTone } from "@/components/domain/StatusBadge";
import type { Tone } from "@/components/ui/Badge";
import type { BookingData, EmployeeData } from "@/lib/data";

interface RoomData {
  id: string;
  nameEn: string;
  nameAr: string;
}

interface ScheduleViewProps {
  locale: Locale;
  date: ISODate;
  mode: string;
  view: string;
  bookings: BookingData[];
  rooms: RoomData[];
  employees: EmployeeData[];
  clinicHours: { day: number; open: string | null; close: string | null }[];
}

const HOUR_START = 11;
const HOUR_END = 21;
const SLOT_HEIGHT = 56;

export function ScheduleView({
  locale,
  date,
  mode: initialMode,
  view: initialView,
  bookings,
  rooms,
  employees,
  clinicHours,
}: ScheduleViewProps) {
  const router = useRouter();
  const [view, setView] = useState<"day" | "week">(initialView as "day" | "week");
  const [mode, setMode] = useState<"room" | "staff">(initialMode as "room" | "staff");

  const cursor = date;
  const dayDate = parseISO(cursor);
  const dayOfWeek = dayDate.getDay();
  const hours = clinicHours.find((h) => h.day === dayOfWeek);
  const isClosed = !hours?.open;

  const goPrev = () => {
    const next = toISODate(addDays(parseISO(cursor), view === "day" ? -1 : -7));
    router.push(`/schedule?date=${next}&mode=${mode}&view=${view}`);
  };
  const goNext = () => {
    const next = toISODate(addDays(parseISO(cursor), view === "day" ? 1 : 7));
    router.push(`/schedule?date=${next}&mode=${mode}&view=${view}`);
  };
  const goToday = () => {
    router.push(`/schedule?date=${todayISO()}&mode=${mode}&view=${view}`);
  };

  const weekStart = view === "week" ? startOfWeek(parseISO(cursor)) : null;

  const columns = useMemo(() => {
    if (mode === "room") return rooms;
    return employees;
  }, [mode, rooms, employees]);

  const dayBookings = useMemo(() => bookings, [bookings]);

  const bookingsByColumn = useMemo(() => {
    const map = new Map<string, BookingData[]>();
    for (const col of columns) {
      map.set(
        col.id,
        dayBookings.filter((b) => (mode === "room" ? b.roomId : b.employeeId) === col.id),
      );
    }
    return map;
  }, [columns, dayBookings, mode]);

  return (
    <>
      <PageHeader
        title={locale === "ar" ? "الجدولة" : "Schedule"}
        actions={
          <div className="hidden sm:block">
            <ToggleGroup
              options={[
                { value: "room", label: locale === "ar" ? "حسب الغرفة" : "By Room" },
                { value: "staff", label: locale === "ar" ? "حسب الموظف" : "By Staff" },
              ]}
              value={mode}
              onChange={(v) => {
                setMode(v as "room" | "staff");
                router.push(`/schedule?date=${cursor}&mode=${v}&view=${view}`);
              }}
            />
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon onClick={goPrev} aria-label="Previous">
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button variant="soft" size="sm" onClick={goToday}>
            {locale === "ar" ? "اليوم" : "Today"}
          </Button>
          <Button variant="secondary" size="sm" icon onClick={goNext} aria-label="Next">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <span className="ms-2 text-sm font-semibold text-ink">
            {view === "day"
              ? formatDateLong(cursor, locale)
              : weekStart
                ? `${formatDate(toISODate(weekStart), locale)} — ${formatDate(
                    toISODate(addDays(weekStart, 6)),
                    locale,
                  )}`
                : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="sm:hidden">
            <ToggleGroup
              options={[
                { value: "room", label: locale === "ar" ? "غرفة" : "Room" },
                { value: "staff", label: locale === "ar" ? "موظف" : "Staff" },
              ]}
              value={mode}
              onChange={(v) => {
                setMode(v as "room" | "staff");
                router.push(`/schedule?date=${cursor}&mode=${v}&view=${view}`);
              }}
            />
          </div>
          <ToggleGroup
            options={[
              { value: "day", label: locale === "ar" ? "يوم" : "Day" },
              { value: "week", label: locale === "ar" ? "أسبوع" : "Week" },
            ]}
            value={view}
            onChange={(v) => {
              setView(v as "day" | "week");
              router.push(`/schedule?date=${cursor}&mode=${mode}&view=${v}`);
            }}
          />
        </div>
      </div>

      {isClosed && view === "day" ? (
        <Card>
          <EmptyState
            icon={<Clock className="h-5 w-5" />}
            title={locale === "ar" ? "مغلق" : "Closed"}
            hint={locale === "ar" ? "العيادة مغلقة في هذا اليوم" : "The clinic is closed on this day"}
          />
        </Card>
      ) : dayBookings.length === 0 && view === "day" ? (
        <Card>
          <EmptyState
            icon={<Clock className="h-5 w-5" />}
            title={locale === "ar" ? "لا توجد حجوزات" : "No bookings"}
          />
        </Card>
      ) : (
        <Card flush className="overflow-hidden">
          <div className="scroll-thin overflow-x-auto">
            <div className="min-w-[48rem]">
              {/* Column headers */}
              <div className="flex border-b border-line bg-raised/70">
                <div className="w-16 shrink-0 border-e border-line" />
                {columns.map((col) => (
                  <div
                    key={col.id}
                    className="flex-1 border-e border-line px-3 py-2.5 last:border-e-0"
                  >
                    {mode === "room" ? (
                      <p className="truncate text-xs font-semibold text-ink">
                        {locale === "ar" ? (col as RoomData).nameAr : (col as RoomData).nameEn}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Avatar
                          initials={(col as EmployeeData).initials}
                          color={(col as EmployeeData).color}
                          size="xs"
                        />
                        <span className="truncate text-xs font-semibold text-ink">
                          {locale === "ar"
                            ? (col as EmployeeData).nameAr
                            : (col as EmployeeData).nameEn}
                        </span>
                      </div>
                    )}
                    <p className="mt-0.5 text-2xs text-ink-4">
                      {bookingsByColumn.get(col.id)?.length ?? 0}{" "}
                      {locale === "ar" ? "جلسات" : "sessions"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Time grid */}
              <div className="flex">
                {/* Hour labels */}
                <div className="w-16 shrink-0 border-e border-line">
                  {Array.from({ length: HOUR_END - HOUR_START + 1 }).map((_, i) => {
                    const hour = HOUR_START + i;
                    return (
                      <div
                        key={hour}
                        className="relative border-b border-line/60"
                        style={{ height: SLOT_HEIGHT }}
                      >
                        <span className="absolute -top-2 end-1.5 text-2xs tabular-nums text-ink-4">
                          {hour > 12 ? hour - 12 : hour}
                          {hour >= 12 ? "pm" : "am"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Columns */}
                {columns.map((col) => (
                  <div
                    key={col.id}
                    className="relative flex-1 border-e border-line last:border-e-0"
                    style={{ height: (HOUR_END - HOUR_START + 1) * SLOT_HEIGHT }}
                  >
                    {/* Hour lines */}
                    {Array.from({ length: HOUR_END - HOUR_START + 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="border-b border-line/60"
                        style={{ height: SLOT_HEIGHT }}
                      />
                    ))}

                    {/* Booking blocks */}
                    {(bookingsByColumn.get(col.id) ?? []).map((booking) => (
                      <BookingBlock key={booking.id} booking={booking} locale={locale} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="text-xs font-medium text-ink-3">
          {locale === "ar" ? "المفتاح" : "Legend"}
        </span>
        {(["confirmed", "checked_in", "in_progress", "completed", "pending", "cancelled"] as const).map(
          (status) => (
            <span key={status} className="inline-flex items-center gap-1.5 text-xs text-ink-3">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded",
                  toneToBg(bookingTone[status]),
                )}
              />
              {L(bookingStatusLabel[status], locale)}
            </span>
          ),
        )}
      </div>
    </>
  );
}

function BookingBlock({ booking, locale }: { booking: BookingData; locale: Locale }) {
  const start = parseISO(booking.startsAt);
  const end = parseISO(booking.endsAt);
  const startMinutes = start.getHours() * 60 + start.getMinutes() - HOUR_START * 60;
  const durationMin = (end.getTime() - start.getTime()) / 60_000;
  const top = (startMinutes / 60) * SLOT_HEIGHT;
  const height = Math.max((durationMin / 60) * SLOT_HEIGHT - 4, 28);

  const tone = bookingTone[booking.status as keyof typeof bookingTone];
  const cancelled = booking.status === "cancelled";

  return (
    <Link
      href={`/bookings?ref=${booking.ref}`}
      className={cn(
        "absolute inset-x-1 z-10 overflow-hidden rounded-md border px-2 py-1.5 text-start transition-shadow hover:shadow-pop",
        toneToBorder(tone),
        toneToBg(tone),
        cancelled && "opacity-50",
      )}
      style={{ top, height }}
    >
      <p className="truncate text-2xs font-semibold tabular-nums text-ink">
        {formatTime(booking.startsAt, locale)}
      </p>
      <p className="truncate text-[0.6875rem] font-medium leading-tight text-ink">
        {booking.customerId}
      </p>
      <p className="truncate text-2xs leading-tight text-ink-2">
        {booking.serviceId}
      </p>
    </Link>
  );
}

function toneToBg(tone: Tone): string {
  const map: Record<Tone, string> = {
    neutral: "bg-ink/[0.04]",
    brand: "bg-brand-soft",
    success: "bg-success-soft",
    warn: "bg-warn-soft",
    danger: "bg-danger-soft",
    info: "bg-info-soft",
    gold: "bg-gold-soft",
    muted: "bg-ink/[0.03]",
  };
  return map[tone];
}

function toneToBorder(tone: Tone): string {
  const map: Record<Tone, string> = {
    neutral: "border-ink/10",
    brand: "border-brand-line",
    success: "border-success-line",
    warn: "border-warn-line",
    danger: "border-danger-line",
    info: "border-info-line",
    gold: "border-gold-line",
    muted: "border-line-strong",
  };
  return map[tone];
}

function ToggleGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-raised p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
            value === opt.value
              ? "bg-surface text-ink shadow-xs"
              : "text-ink-3 hover:text-ink",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
