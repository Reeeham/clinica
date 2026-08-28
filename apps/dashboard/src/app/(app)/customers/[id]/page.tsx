import {
  age,
  customerSourceLabel,
  entitlementStatusLabel,
  formatMoney,
  formatPhone,
  formatDate,
  formatTime,
  skinTypeLabel,
} from "@clinica/core";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Cake,
  AlertTriangle,
  HeartPulse,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Stat";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { CustomerDetailLayout } from "@/components/customers/CustomerDetailLayout";
import { L } from "@/lib/i18n";
import { getTranslator } from "@/lib/locale";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { getCustomerDetail, getEmployees, getServices } from "@/lib/data";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale, t } = await getTranslator();

  const [detail, employeesData, servicesData] = await Promise.all([
    getCustomerDetail(id),
    getEmployees(),
    getServices(),
  ]);
  if (!detail) notFound();

  const { customer, stats, bookings, entitlements } = detail;
  const employeeMap = new Map(employeesData.items.map((e) => [e.id, e]));
  const serviceMap = new Map(servicesData.items.map((s) => [s.id, s]));

  const visits = (stats as { visits?: number }).visits ?? bookings.filter((b) => b.status === "completed").length;
  const lifetimeValue = (stats as { lifetimeValue?: number }).lifetimeValue ?? 0;
  const outstanding = (stats as { outstanding?: number }).outstanding ?? 0;
  const noShows = (stats as { noShows?: number }).noShows ?? bookings.filter((b) => b.status === "no_show").length;
  const nextVisit = (stats as { nextVisit?: string | null }).nextVisit ?? null;

  const customerAge = age(customer.birthDate);

  return (
    <CustomerDetailLayout
      id={id}
      customer={customer}
      bookings={bookings}
      entitlementCount={entitlements.length}
      activeTab="overview"
    >

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column — profile + clinical */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title={t("customers.clinical")} dense />
            <CardBody dense className="space-y-3">
              <InfoRow
                icon={<Cake className="h-4 w-4" />}
                label={t("customers.age")}
                value={customerAge ? t("customers.age", { years: customerAge }) : t("common.none")}
              />
              <InfoRow
                icon={<HeartPulse className="h-4 w-4" />}
                label={t("customers.skinType")}
                value={customer.skinType ? L(skinTypeLabel[customer.skinType], locale) : t("common.none")}
              />
              <InfoRow
                icon={<AlertTriangle className="h-4 w-4" />}
                label={t("customers.allergies")}
                value={
                  customer.allergies.length > 0
                    ? customer.allergies.join(", ")
                    : t("customers.noAllergies")
                }
                danger={customer.allergies.length > 0}
              />
              <InfoRow
                icon={<AlertTriangle className="h-4 w-4" />}
                label={t("customers.conditions")}
                value={
                  customer.conditions.length > 0
                    ? customer.conditions.join(", ")
                    : t("customers.noConditions")
                }
                danger={customer.conditions.length > 0}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t("customers.consent")} dense />
            <CardBody dense className="space-y-3">
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label={t("common.email")}
                value={customer.email ?? t("common.none")}
              />
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label={t("common.phone")}
                value={formatPhone(customer.phone)}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-ink-3">{t("customers.source")}</span>
                <Badge tone="neutral" size="sm">
                  {L(customerSourceLabel[customer.source], locale)}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-ink-3">{t("customers.since")}</span>
                <span className="text-xs font-medium text-ink-2">
                  {formatDate(customer.createdAt, locale)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-ink-3">WhatsApp</span>
                <Badge tone={customer.marketingOptIn ? "success" : "muted"} size="sm">
                  {customer.marketingOptIn ? t("customers.marketingOn") : t("customers.marketingOff")}
                </Badge>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right column — stats + activity */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label={t("customers.col.visits")}
              value={String(visits)}
              tone="brand"
            />
            <Stat
              label={t("customers.lifetime")}
              value={formatMoney(lifetimeValue, { locale, compact: true })}
              tone="gold"
            />
            <Stat
              label={t("customers.outstanding")}
              value={formatMoney(outstanding, { locale, compact: outstanding > 99900 })}
              tone={outstanding > 0 ? "info" : "success"}
            />
            <Stat
              label={t("customers.noShows")}
              value={String(noShows)}
              tone={noShows > 0 ? "info" : "success"}
              invert
            />
          </div>

          {nextVisit ? (
            <Card>
              <CardHeader title={t("customers.nextSession")} dense />
              <CardBody dense>
                {(() => {
                  const booking = bookings.find((b) => b.startsAt === nextVisit);
                  const service = booking ? serviceMap.get(booking.serviceId) : undefined;
                  const employee = booking ? employeeMap.get(booking.employeeId) : undefined;
                  return (
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand">
                        <Calendar className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">
                          {service ? (locale === "ar" ? service.nameAr : service.nameEn) : "—"}
                        </p>
                        <p className="text-xs text-ink-3">
                          {formatDate(nextVisit, locale)} · {formatTime(nextVisit, locale)}
                          {employee ? ` · ${locale === "ar" ? employee.nameAr : employee.nameEn}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={(booking?.status ?? "confirmed") as "pending" | "confirmed" | "checked_in" | "in_progress" | "completed" | "no_show" | "cancelled"} locale={locale} size="sm" />
                    </div>
                  );
                })()}
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader title={t("customers.timeline")} dense />
            {bookings.length === 0 ? (
              <EmptyState compact icon={<Clock className="h-5 w-5" />} title={t("customers.sessionsEmpty")} />
            ) : (
              <div className="divide-y divide-line">
                {bookings.slice(0, 8).map((booking) => {
                  const service = serviceMap.get(booking.serviceId);
                  const employee = employeeMap.get(booking.employeeId);
                  return (
                    <Link
                      key={booking.id}
                      href={`/bookings?ref=${booking.ref}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-softer/60"
                    >
                      <div className="flex w-14 shrink-0 flex-col items-center">
                        <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">
                          {formatTime(booking.startsAt, locale)}
                        </span>
                        <span className="text-2xs tabular-nums text-ink-4">
                          {formatDate(booking.startsAt, locale)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.8125rem] font-medium text-ink">
                          {service ? (locale === "ar" ? service.nameAr : service.nameEn) : "—"}
                        </p>
                        <p className="truncate text-xs text-ink-3">
                          {employee ? (locale === "ar" ? employee.nameAr : employee.nameEn) : t("common.unassigned")}
                        </p>
                      </div>
                      <StatusBadge status={booking.status as "pending" | "confirmed" | "checked_in" | "in_progress" | "completed" | "no_show" | "cancelled"} locale={locale} size="sm" />
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {entitlements.length > 0 ? (
            <Card>
              <CardHeader title={t("customers.tab.packages")} dense />
              <div className="divide-y divide-line">
                {entitlements.map((ent) => {
                  const entTyped = ent as { id: string; packageId: string; status: string; expiresAt: string; balance?: Array<{ serviceId: string; total: number; used: number }> };
                  const used = entTyped.balance?.reduce((a, b) => a + b.used, 0) ?? 0;
                  const total = entTyped.balance?.reduce((a, b) => a + b.total, 0) ?? 0;
                  const remaining = total - used;
                  return (
                    <div key={entTyped.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[0.8125rem] font-medium text-ink">
                          {locale === "ar" ? "باقة" : "Package"}
                        </p>
                        <Badge tone="neutral" size="sm">
                          {L(entitlementStatusLabel[entTyped.status as keyof typeof entitlementStatusLabel] ?? { en: entTyped.status, ar: entTyped.status }, locale)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-2xs text-ink-3">
                          {t("customers.remaining", { count: remaining })}
                        </span>
                        <span className="ms-auto text-2xs text-ink-4">
                          {t("customers.expires", { date: formatDate(entTyped.expiresAt, locale) })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </CustomerDetailLayout>
  );
}

function InfoRow({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-xs text-ink-3">
        <span className={cn(danger ? "text-danger" : "text-ink-4")}>{icon}</span>
        {label}
      </span>
      <span className={cn("text-end text-xs font-medium", danger ? "text-danger" : "text-ink-2")}>
        {value}
      </span>
    </div>
  );
}
