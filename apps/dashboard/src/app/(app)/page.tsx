import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  CalendarClock,
  CreditCard,
  Smartphone,
  Sparkles,
  UserPlus,
} from "lucide-react";
import {
  bookingChannelLabel,
  formatDate,
  formatMoney,
  formatNumber,
  formatPercent,
  todayISO,
  type Booking,
  type Locale,
} from "@clinica/core";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { Ring, Progress } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { TrendChart } from "@/components/charts/TrendChart";
import { BarList } from "@/components/charts/BarList";
import { BookingListItem } from "@/components/domain/BookingListItem";
import { Avatar } from "@/components/ui/Avatar";
import { L } from "@/lib/i18n";
import { getTranslator } from "@/lib/locale";
import {
  getOverview,
  getTodaySnapshot,
  getUpcomingBookings,
  getRevenueSeries,
  getTopServices,
  getChannelMix,
  getEmployees,
  getBookings,
} from "@/lib/data";

export default async function OverviewPage() {
  const { locale, t } = await getTranslator();

  const [metrics, snapshot, upcomingRaw, seriesData, topData, mixData, employeesData, todayBookings] = await Promise.all([
    getOverview(),
    getTodaySnapshot(),
    getUpcomingBookings(6),
    getRevenueSeries(30),
    getTopServices(30, 5),
    getChannelMix(30),
    getEmployees(),
    getBookings({ pageSize: 100 }),
  ]);

  const series = seriesData.items.map((p) => ({ date: p.date, value: p.value, secondary: p.secondary }));
  const top = topData.items;
  const mix = mixData.items;
  const next = upcomingRaw as Array<Record<string, unknown>>;
  const today = todayBookings.items;
  const owner = employeesData.items[0];
  const roomsCount = 4;

  const hour = new Date().getHours();
  const part =
    hour < 12
      ? t("overview.part.morning")
      : hour < 17
        ? t("overview.part.afternoon")
        : t("overview.part.evening");
  const firstName = owner
    ? (locale === "ar" ? owner.nameAr : owner.nameEn).replace("Dr. ", "").replace("د. ", "").split(" ")[0]
    : "";

  const mixTotal = mix.reduce((a, m) => a + m.count, 0) || 1;

  const occupancy = snapshot && snapshot.total > 0 ? snapshot.completed / snapshot.total : 0;

  return (
    <>
      <PageHeader
        title={t("overview.greeting", { part, name: firstName })}
        subtitle={t("overview.subtitle", { count: today.length, rooms: roomsCount })}
        actions={
          <>
            <Link href="/schedule" className={buttonClass({ variant: "secondary", size: "md" })}>
              <CalendarClock className="h-4 w-4" />
              {t("nav.schedule")}
            </Link>
            <Link href="/bookings?new=1" className={buttonClass({ variant: "primary", size: "md" })}>
              {t("action.newBooking")}
            </Link>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label={t("overview.kpi.revenue")}
          value={formatMoney(metrics?.revenue.value ?? 0, { locale, compact: true })}
          delta={metrics?.revenue.delta ?? 0}
          trend={series.map((point) => point.value)}
          hint={t("common.last30")}
          icon={<CreditCard className="h-4 w-4" strokeWidth={1.8} />}
        />
        <Stat
          label={t("overview.kpi.sessions")}
          value={formatNumber(metrics?.sessions.value ?? 0, locale)}
          delta={metrics?.sessions.delta ?? 0}
          tone="success"
          hint={`${t("overview.kpi.avgTicket")} · ${formatMoney(metrics?.averageTicket.value ?? 0, { locale })}`}
          icon={<Sparkles className="h-4 w-4" strokeWidth={1.8} />}
        />
        <Stat
          label={t("overview.kpi.appShare")}
          value={formatPercent(metrics?.appShare.value ?? 0, locale)}
          tone="gold"
          hint={`${t("billing.fees")} · ${formatMoney(metrics?.platformFees ?? 0, { locale })}`}
          icon={<Smartphone className="h-4 w-4" strokeWidth={1.8} />}
        />
        <Stat
          label={t("overview.kpi.newClients")}
          value={formatNumber(metrics?.newCustomers.value ?? 0, locale)}
          tone="info"
          hint={`${t("overview.kpi.noShow")} · ${formatPercent(metrics?.noShowRate.value ?? 0, locale, 1)}`}
          icon={<UserPlus className="h-4 w-4" strokeWidth={1.8} />}
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={t("overview.revenueTrend")}
            hint={t("overview.revenueTrendHint")}
            action={
              <Badge tone="neutral" size="sm">
                {t("common.last30")}
              </Badge>
            }
          />
          <CardBody>
            {series.length > 0 ? (
              <TrendChart points={series} locale={locale} />
            ) : (
              <EmptyState
                icon={<CreditCard className="h-5 w-5" />}
                title={t("overview.revenueTrend")}
                hint={t("overview.revenueTrendHint")}
                compact
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={t("overview.today")}
            hint={formatDate(todayISO(), locale)}
          />
          <CardBody className="space-y-5">
            <div className="flex items-center gap-4">
              <Ring
                value={occupancy}
                size={72}
                stroke={7}
                label={formatPercent(occupancy, locale)}
              />
              <div className="min-w-0">
                <p className="text-[0.8125rem] font-medium text-ink">{t("overview.occupancy")}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-3">
                  {snapshot?.completed ?? 0} / {snapshot?.total ?? 0} {t("common.sessions")}
                  {(snapshot?.inProgress ?? 0) > 0 ? (
                    <span className="ms-1.5 inline-flex items-center gap-1 text-success">
                      <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />
                      {snapshot?.inProgress ?? 0} {t("schedule.now")}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-line bg-raised p-3">
                <dt className="text-2xs uppercase tracking-[0.06em] text-ink-4">
                  {t("overview.expected")}
                </dt>
                <dd className="mt-1 text-[0.9375rem] font-semibold tabular-nums text-ink">
                  {formatMoney(snapshot?.expectedRevenue ?? 0, { locale, compact: true })}
                </dd>
              </div>
              <div className="rounded-lg border border-line bg-raised p-3">
                <dt className="text-2xs uppercase tracking-[0.06em] text-ink-4">
                  {t("overview.collected")}
                </dt>
                <dd className="mt-1 text-[0.9375rem] font-semibold tabular-nums text-success">
                  {formatMoney(snapshot?.collected ?? 0, { locale, compact: true })}
                </dd>
              </div>
            </dl>

            <div className="space-y-2.5">
              <Row label={t("bookings.range.upcoming")} value={formatNumber(snapshot?.remaining ?? 0, locale)} />
              <Row
                label={t("overview.kpi.sessions")}
                value={formatNumber(snapshot?.completed ?? 0, locale)}
              />
              <Row
                label={t("overview.awaiting")}
                value={formatNumber(snapshot?.awaitingConfirmation ?? 0, locale)}
                tone={(snapshot?.awaitingConfirmation ?? 0) > 0 ? "warn" : undefined}
              />
            </div>
          </CardBody>
          <CardFooter>
            <span>{t("overview.occupancy")}</span>
            <Link
              href="/schedule"
              className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
            >
              {t("action.viewAll")}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </CardFooter>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={t("overview.upNext")}
            hint={t("overview.subtitle", { count: today.length, rooms: roomsCount })}
            action={
              <Link
                href="/schedule"
                className={buttonClass({ variant: "ghost", size: "sm" })}
              >
                {t("action.viewAll")}
              </Link>
            }
          />
          {next.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="h-5 w-5" />}
              title={t("overview.upNextEmpty")}
              compact
            />
          ) : (
            <div className="divide-y divide-line">
              {next.map((booking) => {
                const b = booking as unknown as Booking & { customer?: { id: string; nameEn: string; nameAr: string; phone: string; color: string; initials: string }; service?: { id: string; nameEn: string; nameAr: string; durationMin: number }; employee?: { id: string; nameEn: string; nameAr?: string; initials: string; color: string } };
                return (
                  <BookingListItem
                    key={b.id}
                    booking={b}
                    locale={locale}
                    customer={b.customer ? { nameEn: b.customer.nameEn, nameAr: b.customer.nameAr, initials: b.customer.initials, color: b.customer.color } : undefined}
                    service={b.service ? { nameEn: b.service.nameEn, nameAr: b.service.nameAr, durationMin: b.service.durationMin } : undefined}
                    employee={b.employee ? { nameEn: b.employee.nameEn, nameAr: b.employee.nameAr ?? "", initials: b.employee.initials, color: b.employee.color } : undefined}
                  />
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title={t("overview.topServices")} hint={t("common.last30")} />
          <CardBody dense>
            <BarList
              items={top.map((row, index) => ({
                id: row.serviceId,
                label: locale === "ar" ? row.nameAr : row.nameEn,
                meta: `${row.sessions} ${t("common.sessions")}`,
                value: formatMoney(row.revenue, { locale, compact: true }),
                ratio: top[0] ? row.revenue / top[0].revenue : 0,
                tone: index === 0 ? "brand" : "info",
                href: `/catalog?tab=services&focus=${row.serviceId}`,
              }))}
            />
          </CardBody>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title={t("overview.channelMix")} hint={t("common.last30")} />
          <CardBody dense className="space-y-3">
            {mix.map((row) => (
              <div key={row.channel}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-ink-2">
                    {L(bookingChannelLabel[row.channel as keyof typeof bookingChannelLabel], locale)}
                  </span>
                  <span className="tabular-nums text-ink-3">
                    {formatPercent(row.count / mixTotal, locale)}
                  </span>
                </div>
                <Progress
                  value={row.count / mixTotal}
                  tone={row.channel === "App" ? "brand" : "neutral"}
                />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={t("overview.followUps")}
            hint={t("overview.followUpsHint")}
            action={<BadgePercent className="h-4 w-4 text-ink-4" strokeWidth={1.8} />}
          />
          <EmptyState title={t("overview.followUpsEmpty")} compact />
          <CardFooter>
            <span>{t("overview.followUps")}</span>
            <Link
              href="/customers"
              className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
            >
              {t("action.viewAll")}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </CardFooter>
        </Card>
      </section>
    </>
  );
}

function Row({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "warn";
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[0.8125rem]">
      <span className="text-ink-3">{label}</span>
      <span
        className={
          tone === "warn"
            ? "font-semibold tabular-nums text-warn"
            : "font-semibold tabular-nums text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
