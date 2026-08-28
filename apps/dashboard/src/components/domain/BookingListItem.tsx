import Link from "next/link";
import { Clock, DoorOpen } from "lucide-react";
import {
  formatMoney,
  formatTime,
  getCustomer,
  getEmployee,
  getRoom,
  getService,
  type Booking,
  type Locale,
  type Localized,
} from "@clinica/core";
import { cn } from "@/lib/cn";
import { L, translatorFor } from "@/lib/i18n";
import { Avatar } from "@/components/ui/Avatar";
import { ChannelBadge, StatusBadge } from "./StatusBadge";

interface NestedEntity {
  name?: Localized;
  nameEn?: string;
  nameAr?: string;
  initials?: string;
  color?: string;
  durationMin?: number;
}

/** One row in any appointment list. Everything reception needs at a glance. */
export function BookingListItem({
  booking,
  locale,
  showDate = false,
  customer: nestedCustomer,
  employee: nestedEmployee,
  service: nestedService,
  room: nestedRoom,
}: {
  booking: Booking;
  locale: Locale;
  showDate?: boolean;
  customer?: NestedEntity;
  employee?: NestedEntity;
  service?: NestedEntity;
  room?: NestedEntity;
}) {
  const t = translatorFor(locale);
  const customer = nestedCustomer
    ? { name: nestedCustomer.name ?? { en: nestedCustomer.nameEn ?? "", ar: nestedCustomer.nameAr ?? "" }, initials: nestedCustomer.initials ?? "", color: nestedCustomer.color ?? "#7A2F5F" }
    : getCustomer(booking.customerId);
  const service = nestedService
    ? { name: nestedService.name ?? { en: nestedService.nameEn ?? "", ar: nestedService.nameAr ?? "" }, durationMin: nestedService.durationMin ?? 0 }
    : getService(booking.serviceId);
  const employee = nestedEmployee
    ? { name: nestedEmployee.name ?? { en: nestedEmployee.nameEn ?? "", ar: nestedEmployee.nameAr ?? "" }, initials: nestedEmployee.initials ?? "", color: nestedEmployee.color ?? "#2B5FA8" }
    : getEmployee(booking.employeeId);
  const room = nestedRoom
    ? { name: nestedRoom.name ?? { en: nestedRoom.nameEn ?? "", ar: nestedRoom.nameAr ?? "" } }
    : getRoom(booking.roomId);

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 transition-colors hover:bg-brand-softer/60",
        booking.status === "cancelled" && "opacity-60",
      )}
    >
      <div className="w-16 shrink-0 text-center">
        <p className="text-[0.8125rem] font-semibold tabular-nums text-ink">
          {formatTime(booking.startsAt, locale)}
        </p>
        <p className="mt-0.5 text-2xs tabular-nums text-ink-4">
          {service ? `${service.durationMin} ${t("common.minutes")}` : ""}
        </p>
      </div>

      <span className="h-9 w-px shrink-0 bg-line" />

      <Link
        href={`/customers/${booking.customerId}`}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md py-0.5 transition-colors hover:text-brand"
      >
        {customer ? (
          <Avatar initials={customer.initials} color={customer.color} size="sm" />
        ) : null}
        <span className="min-w-0">
          <span className="block truncate text-[0.8125rem] font-medium text-ink">
            {L(customer?.name, locale)}
          </span>
          <span className="block truncate text-xs text-ink-3">
            {L(service?.name, locale)}
            {booking.sessionNumber
              ? ` · ${t("bookings.sessionOf", {
                  n: booking.sessionNumber,
                  total: booking.sessionTotal ?? 0,
                })}`
              : ""}
          </span>
        </span>
      </Link>

      <div className="hidden min-w-0 items-center gap-2 md:flex">
        {employee ? (
          <>
            <Avatar initials={employee.initials} color={employee.color} size="xs" />
            <span className="truncate text-xs text-ink-2">{L(employee.name, locale)}</span>
          </>
        ) : null}
      </div>

      <div className="hidden w-24 shrink-0 items-center gap-1.5 text-xs text-ink-3 lg:flex">
        <DoorOpen className="h-3.5 w-3.5 shrink-0 text-ink-4" strokeWidth={1.8} />
        <span className="truncate">{L(room?.name, locale)}</span>
      </div>

      <div className="hidden w-24 shrink-0 text-end lg:block">
        {booking.entitlementId ? (
          <span className="text-xs text-ink-3">{t("common.free")}</span>
        ) : (
          <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">
            {formatMoney(booking.price, { locale })}
          </span>
        )}
      </div>

      <div className="hidden shrink-0 sm:block">
        <ChannelBadge channel={booking.channel} locale={locale} />
      </div>

      <div className="shrink-0">
        <StatusBadge status={booking.status} locale={locale} size="sm" />
      </div>

      {showDate ? (
        <div className="hidden w-20 shrink-0 items-center gap-1 text-xs text-ink-3 xl:flex">
          <Clock className="h-3.5 w-3.5 text-ink-4" strokeWidth={1.8} />
          {booking.startsAt.slice(5, 10)}
        </div>
      ) : null}
    </div>
  );
}
