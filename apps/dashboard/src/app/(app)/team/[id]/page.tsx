import {
  employeeRoleLabel,
  employeeStatusLabel,
  formatMoney,
  formatPercent,
  formatDate,
} from "@clinica/core";
import { notFound } from "next/navigation";
import { Mail, Phone, Calendar, Star } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, Dot } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { Progress } from "@/components/ui/Progress";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { L } from "@/lib/i18n";
import { getTranslator } from "@/lib/locale";
import Link from "next/link";
import { getEmployeeDetail, getServices, getCustomers, getBookings } from "@/lib/data";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale, t } = await getTranslator();

  const [detail, servicesData, customersData, bookingsData] = await Promise.all([
    getEmployeeDetail(id),
    getServices(),
    getCustomers(),
    getBookings({ employeeId: id, pageSize: 50 }),
  ]);
  if (!detail) notFound();

  const { employee, shifts, stats } = detail;
  const serviceMap = new Map(servicesData.items.map((s) => [s.id, s]));
  const customerMap = new Map(customersData.items.map((c) => [c.id, c]));
  const upcoming = bookingsData.items.filter((b) =>
    ["pending", "confirmed", "checked_in", "in_progress"].includes(b.status)
  ).slice(0, 8);

  const dayLabels = locale === "ar" ? DAYS_AR : DAYS;
  const sessions30d = (stats as { sessions30d?: number }).sessions30d ?? 0;
  const revenue30d = (stats as { revenue30d?: number }).revenue30d ?? 0;
  const commission30d = (stats as { commission30d?: number }).commission30d ?? 0;
  const rebookRate = (stats as { rebookRate?: number }).rebookRate ?? 0;
  const utilisation = (stats as { utilisation?: number }).utilisation ?? 0;

  return (
    <>
      <PageHeader
        backHref="/team"
        backLabel={t("nav.team")}
        title={
          <span className="flex items-center gap-3">
            <Avatar initials={employee.initials} color={employee.color} size="lg" />
            <span>
              <span className="block">{locale === "ar" ? employee.nameAr : employee.nameEn}</span>
              <span className="mt-1 block text-sm font-normal text-ink-3">
                {locale === "ar" ? employee.titleAr : employee.titleEn}
              </span>
            </span>
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <a
              href={`tel:${employee.phone}`}
              className={buttonClass({ variant: "secondary", size: "sm", icon: true })}
              aria-label={t("action.call")}
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${employee.email}`}
              className={buttonClass({ variant: "secondary", size: "sm", icon: true })}
              aria-label={t("common.email")}
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        }
        meta={
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="brand" size="sm">
              {L(employeeRoleLabel[employee.role as keyof typeof employeeRoleLabel], locale)}
            </Badge>
            <span className="flex items-center gap-1.5 text-xs text-ink-3">
              <Dot
                tone={
                  employee.status === "active"
                    ? "success"
                    : employee.status === "on_leave"
                      ? "warn"
                      : "muted"
                }
              />
              {L(employeeStatusLabel[employee.status as keyof typeof employeeStatusLabel], locale)}
            </span>
            <span className="flex items-center gap-1 text-xs text-ink-3">
              <Star className="h-3.5 w-3.5 text-gold" />
              {(employee.rating ?? 0).toFixed(1)}
            </span>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left — profile + shifts */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title={t("team.payroll")} dense />
            <CardBody dense className="space-y-3">
              <Row label={t("team.baseSalary")} value={formatMoney(employee.salary, { locale })} />
              <Row
                label={t("team.commissionRate")}
                value={formatPercent(employee.commissionRate, locale, 1)}
              />
              <Row
                label={t("team.estimated")}
                value={formatMoney(
                  employee.salary + Math.round(revenue30d * employee.commissionRate * 4.3),
                  { locale, compact: true },
                )}
              />
              <Row
                label={t("team.hired")}
                value={formatDate(employee.hiredAt, locale)}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t("team.shifts")} dense />
            <CardBody dense>
              {shifts.length === 0 ? (
                <p className="text-xs text-ink-4">{t("team.noShifts")}</p>
              ) : (
                <div className="space-y-2">
                  {shifts.map((shift, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-ink-2">
                        {dayLabels[shift.day]}
                      </span>
                      <span className="text-xs tabular-nums text-ink-3">
                        {shift.from} — {shift.to}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t("team.specialties")} dense />
            <CardBody dense>
              <div className="flex flex-wrap gap-1.5">
                {(employee.specialties ?? []).map((cat) => (
                  <Badge key={cat} tone="neutral" size="sm">{cat}</Badge>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t("team.access")} dense />
            <CardBody dense>
              <Badge tone={employee.canLogin ? "success" : "muted"} size="sm">
                {employee.canLogin ? t("team.accessOn") : t("team.accessOff")}
              </Badge>
            </CardBody>
          </Card>
        </div>

        {/* Right — stats + upcoming */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label={t("team.col.sessions")}
              value={String(sessions30d)}
              tone="brand"
            />
            <Stat
              label={t("team.col.revenue")}
              value={formatMoney(revenue30d, { locale, compact: true })}
              tone="gold"
            />
            <Stat
              label={t("team.col.commission")}
              value={formatMoney(commission30d, { locale, compact: true })}
              tone="success"
            />
            <Stat
              label={t("team.rebook")}
              value={formatPercent(rebookRate, locale)}
              tone="info"
            />
          </div>

          <Card>
            <CardHeader title={t("team.col.utilisation")} dense />
            <CardBody dense>
              <div className="flex items-center gap-4">
                <Progress value={utilisation} tone="brand" height="h-2.5" className="flex-1" />
                <span className="text-sm font-semibold tabular-nums text-ink">
                  {formatPercent(utilisation, locale)}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={t("team.col.upcoming")}
              action={
                <Link href={`/bookings?employee=${employee.id}`} className="text-xs font-medium text-brand hover:underline">
                  {t("action.viewAll")}
                </Link>
              }
              dense
            />
            {upcoming.length === 0 ? (
              <EmptyState compact icon={<Calendar className="h-5 w-5" />} title={t("bookings.empty")} />
            ) : (
              <div className="divide-y divide-line">
                {upcoming.map((booking) => {
                  const service = serviceMap.get(booking.serviceId);
                  const customer = customerMap.get(booking.customerId);
                  return (
                    <Link
                      key={booking.id}
                      href={`/bookings?ref=${booking.ref}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-softer/60"
                    >
                      <div className="flex w-14 shrink-0 flex-col items-center">
                        <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">
                          {booking.startsAt.slice(11, 16)}
                        </span>
                        <span className="text-2xs tabular-nums text-ink-4">
                          {formatDate(booking.startsAt, locale)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.8125rem] font-medium text-ink">
                          {customer ? (locale === "ar" ? customer.nameAr : customer.nameEn) : "—"}
                        </p>
                        <p className="truncate text-xs text-ink-3">
                          {service ? (locale === "ar" ? service.nameAr : service.nameEn) : "—"}
                        </p>
                      </div>
                      <StatusBadge status={booking.status as "pending" | "confirmed" | "checked_in" | "in_progress" | "completed" | "no_show" | "cancelled"} locale={locale} size="sm" />
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-ink-3">{label}</span>
      <span className="text-xs font-semibold tabular-nums text-ink-2">{value}</span>
    </div>
  );
}
