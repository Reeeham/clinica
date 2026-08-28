import {
  bookingStatusLabel,
  formatMoney,
  formatTime,
  formatDate,
  todayISO,
  type BookingStatus,
} from "@clinica/core";
import { CalendarSearch } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { TableWrap, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass } from "@/components/ui/Button";
import { TabLinks } from "@/components/ui/Tabs";
import { StatusBadge, ChannelBadge } from "@/components/domain/StatusBadge";
import { L } from "@/lib/i18n";
import { getTranslator } from "@/lib/locale";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { getBookings, getCustomers, getEmployees, getServices, getClinicSettings } from "@/lib/data";
import type { BookingData, CustomerData, EmployeeData, ServiceData, ClinicData } from "@/lib/data";
import { BookingFormModal } from "@/components/bookings/BookingFormModal";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, t } = await getTranslator();
  const params = await searchParams;

  const statusParam = typeof params.status === "string" ? params.status : undefined;
  const rangeParam = typeof params.range === "string" ? params.range : "upcoming";
  const searchParam = typeof params.search === "string" ? params.search : undefined;
  const channelParam = typeof params.channel === "string" ? params.channel : undefined;
  const employeeParam = typeof params.employee === "string" ? params.employee : undefined;

  const today = todayISO();

  const apiParams: Record<string, string | number | undefined> = { pageSize: 100 };
  if (statusParam) apiParams.status = statusParam;
  if (searchParam) apiParams.search = searchParam;
  if (employeeParam) apiParams.employeeId = employeeParam;
  if (rangeParam === "today") apiParams.date = today;
  else if (rangeParam === "past") apiParams.to = today;
  else if (rangeParam === "upcoming") apiParams.from = today;

  const [bookingsData, customersData, employeesData, servicesData, clinicData] = await Promise.all([
    getBookings(apiParams),
    getCustomers(),
    getEmployees(),
    getServices(),
    getClinicSettings(),
  ]);

  const result = bookingsData.items;

  const customerMap = new Map<string, CustomerData>(customersData.items.map((c) => [c.id, c]));
  const employeeMap = new Map<string, EmployeeData>(employeesData.items.map((e) => [e.id, e]));
  const serviceMap = new Map<string, ServiceData>(servicesData.items.map((s) => [s.id, s]));
  const roomMap = new Map<string, { id: string; nameEn: string; nameAr: string }>(
    (clinicData?.rooms ?? []).map((r) => [r.id, r]),
  );

  const rangeTabs = [
    { href: "/bookings?range=upcoming", label: t("bookings.range.upcoming"), active: rangeParam === "upcoming", count: result.length },
    { href: "/bookings?range=today", label: t("bookings.range.today"), active: rangeParam === "today" },
    { href: "/bookings?range=past", label: t("bookings.range.past"), active: rangeParam === "past" },
    { href: "/bookings?range=all", label: t("bookings.range.all"), active: rangeParam === "all" },
  ];

  const statusFilters: { key: BookingStatus; href: string }[] = [
    { key: "pending", href: buildFilter(params, { status: "pending" }) },
    { key: "confirmed", href: buildFilter(params, { status: "confirmed" }) },
    { key: "checked_in", href: buildFilter(params, { status: "checked_in" }) },
    { key: "in_progress", href: buildFilter(params, { status: "in_progress" }) },
    { key: "completed", href: buildFilter(params, { status: "completed" }) },
    { key: "no_show", href: buildFilter(params, { status: "no_show" }) },
    { key: "cancelled", href: buildFilter(params, { status: "cancelled" }) },
  ];

  return (
    <>
      <PageHeader
        title={t("bookings.title")}
        subtitle={t("bookings.subtitle")}
        actions={
          <Link href="/bookings?new=1" className={buttonClass({ variant: "primary", size: "md" })}>
            {t("action.newBooking")}
          </Link>
        }
      />

      <div className="mb-4">
        <TabLinks items={rangeTabs} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href={buildFilter(params, { status: undefined })}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            !statusParam ? "bg-brand-soft text-brand-ink" : "text-ink-3 hover:bg-ink/[0.04]",
          )}
        >
          {t("common.all")}
        </Link>
        {statusFilters.map((filter) => (
          <Link
            key={filter.key}
            href={filter.href}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              statusParam === filter.key
                ? "bg-brand-soft text-brand-ink"
                : "text-ink-3 hover:bg-ink/[0.04]",
            )}
          >
            {L(bookingStatusLabel[filter.key], locale)}
          </Link>
        ))}
      </div>

      <Card flush>
        {result.length === 0 ? (
          <EmptyState
            icon={<CalendarSearch className="h-5 w-5" />}
            title={t("bookings.empty")}
            hint={t("bookings.emptyHint")}
          />
        ) : (
          <TableWrap>
            <THead>
              <TH>{t("common.time")}</TH>
              <TH>{t("common.client")}</TH>
              <TH>{t("common.service")}</TH>
              <TH className="hidden md:table-cell">{t("common.staff")}</TH>
              <TH className="hidden lg:table-cell">{t("common.room")}</TH>
              <TH align="end" className="hidden lg:table-cell">{t("common.price")}</TH>
              <TH className="hidden sm:table-cell">{t("common.channel")}</TH>
              <TH>{t("common.status")}</TH>
            </THead>
            <TBody>
              {result.map((booking) => {
                const customer = customerMap.get(booking.customerId);
                const service = serviceMap.get(booking.serviceId);
                const employee = employeeMap.get(booking.employeeId);
                const room = roomMap.get(booking.roomId);
                return (
                  <TR key={booking.id} interactive>
                    <TD>
                      <div className="flex flex-col">
                        <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">
                          {formatTime(booking.startsAt, locale)}
                        </span>
                        <span className="text-2xs tabular-nums text-ink-4">
                          {formatDate(booking.startsAt, locale)}
                        </span>
                      </div>
                    </TD>
                    <TD>
                      <Link
                        href={`/customers/${booking.customerId}`}
                        className="flex items-center gap-2 rounded-md py-0.5 transition-colors hover:text-brand"
                      >
                        {customer ? (
                          <Avatar initials={customer.initials} color={customer.color} size="xs" />
                        ) : null}
                        <span className="truncate text-[0.8125rem] font-medium text-ink">
                          {customer ? (locale === "ar" ? customer.nameAr : customer.nameEn) : "—"}
                        </span>
                      </Link>
                    </TD>
                    <TD>
                      <span className="block max-w-[12rem] truncate text-[0.8125rem] text-ink-2">
                        {service ? (locale === "ar" ? service.nameAr : service.nameEn) : "—"}
                      </span>
                      {booking.sessionNumber ? (
                        <span className="text-2xs text-ink-4">
                          {t("bookings.sessionOf", {
                            n: booking.sessionNumber,
                            total: booking.sessionTotal ?? 0,
                          })}
                        </span>
                      ) : null}
                    </TD>
                    <TD className="hidden md:table-cell">
                      {employee ? (
                        <span className="flex items-center gap-1.5">
                          <Avatar initials={employee.initials} color={employee.color} size="xs" />
                          <span className="truncate text-xs text-ink-2">
                            {locale === "ar" ? employee.nameAr : employee.nameEn}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-ink-4">{t("common.unassigned")}</span>
                      )}
                    </TD>
                    <TD className="hidden lg:table-cell">
                      <span className="text-xs text-ink-3">{room ? (locale === "ar" ? room.nameAr : room.nameEn) : "—"}</span>
                    </TD>
                    <TD align="end" className="hidden lg:table-cell">
                      {booking.entitlementId ? (
                        <span className="text-xs text-ink-3">{t("common.free")}</span>
                      ) : (
                        <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">
                          {formatMoney(booking.price, { locale })}
                        </span>
                      )}
                    </TD>
                    <TD className="hidden sm:table-cell">
                      <ChannelBadge channel={booking.channel as "app" | "walk_in" | "phone" | "instagram"} locale={locale} />
                    </TD>
                    <TD>
                      <StatusBadge status={booking.status as "pending" | "confirmed" | "checked_in" | "in_progress" | "completed" | "no_show" | "cancelled"} locale={locale} size="sm" />
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </TableWrap>
        )}
      </Card>

      {result.length > 0 ? (
        <p className="mt-3 text-xs text-ink-4">
          {t("common.showing")} {result.length} {t("common.results")}
        </p>
      ) : null}

      <BookingFormModal
        customers={customersData.items}
        employees={employeesData.items}
        services={servicesData.items}
        rooms={clinicData?.rooms ?? []}
      />
    </>
  );
}

function buildFilter(
  params: Record<string, string | string[] | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const merged: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") merged[key] = value;
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete merged[key];
    else merged[key] = value;
  }
  const search = new URLSearchParams(merged);
  return `/bookings?${search.toString()}`;
}
