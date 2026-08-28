import {
  formatMoney,
  formatDate,
  formatTime,
  paymentMethodLabel,
  payoutStatusLabel,
  type PaymentMethod,
} from "@clinica/core";
import { Wallet, Receipt, Banknote } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { TableWrap, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Stat";
import { TabLinks } from "@/components/ui/Tabs";
import { MethodBadge, OrderStatusBadge } from "@/components/domain/StatusBadge";
import { BarList } from "@/components/charts/BarList";
import { L } from "@/lib/i18n";
import { getTranslator } from "@/lib/locale";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { getPayments, getOutstanding, getPayouts, getMethodMix, getCustomers } from "@/lib/data";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, t } = await getTranslator();
  const params = await searchParams;

  const tabParam = typeof params.tab === "string" ? params.tab : "payments";

  const tabs = [
    { href: "/billing?tab=payments", label: t("billing.tab.payments"), active: tabParam === "payments" },
    { href: "/billing?tab=outstanding", label: t("billing.tab.outstanding"), active: tabParam === "outstanding" },
    { href: "/billing?tab=payouts", label: t("billing.tab.payouts"), active: tabParam === "payouts" },
  ];

  const [paymentsData, outstandingData, payoutsData, methodMixData, customersData] = await Promise.all([
    getPayments(),
    getOutstanding(),
    getPayouts(),
    getMethodMix(30),
    getCustomers(),
  ]);

  const recentPayments = paymentsData.items.slice(0, 50);
  const openOrders = outstandingData.items as Array<{ id: string; ref: string; customerId: string; createdAt: string; total: number; paid: number; balance: number; status: string }>;
  const payouts = payoutsData.items;
  const methodMix = methodMixData.items as Array<{ method: string; amount: number }>;
  const customerMap = new Map(customersData.items.map((c) => [c.id, c]));

  const totalCollected = recentPayments
    .filter((p) => p.status === "succeeded")
    .reduce((a, p) => a + p.amount, 0);
  const appCollected = recentPayments
    .filter((p) => p.status === "succeeded" && p.method === "app_online")
    .reduce((a, p) => a + p.amount, 0);
  const totalFees = recentPayments
    .filter((p) => p.status === "succeeded")
    .reduce((a, p) => a + p.platformFee, 0);
  const outstandingTotal = openOrders.reduce((a, o) => a + Math.max(0, o.balance), 0);

  return (
    <>
      <PageHeader title={t("billing.title")} subtitle={t("billing.subtitle")} />

      <div className="mb-6">
        <TabLinks items={tabs} />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t("billing.collected")}
          value={formatMoney(totalCollected, { locale, compact: true })}
          tone="brand"
        />
        <Stat
          label={t("billing.viaApp")}
          value={formatMoney(appCollected, { locale, compact: true })}
          tone="info"
        />
        <Stat
          label={t("billing.fees")}
          value={formatMoney(totalFees, { locale, compact: true })}
          tone="gold"
        />
        <Stat
          label={t("billing.outstandingTotal")}
          value={formatMoney(outstandingTotal, { locale, compact: true })}
          tone={outstandingTotal > 0 ? "info" : "success"}
        />
      </div>

      {tabParam === "payments" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card flush>
              <CardHeader title={t("billing.tab.payments")} dense />
              {recentPayments.length === 0 ? (
                <EmptyState icon={<Wallet className="h-5 w-5" />} title={t("billing.paymentsEmpty")} />
              ) : (
                <TableWrap>
                  <THead>
                    <TH>{t("common.date")}</TH>
                    <TH>{t("common.client")}</TH>
                    <TH className="hidden sm:table-cell">{t("common.method")}</TH>
                    <TH align="end">{t("common.total")}</TH>
                    <TH align="end" className="hidden lg:table-cell">{t("billing.fees")}</TH>
                    <TH>{t("common.status")}</TH>
                  </THead>
                  <TBody>
                    {recentPayments.map((payment) => {
                      const customer = customerMap.get(payment.customerId);
                      return (
                        <TR key={payment.id} interactive>
                          <TD>
                            <div className="flex flex-col">
                              <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">
                                {formatDate(payment.paidAt, locale)}
                              </span>
                              <span className="text-2xs tabular-nums text-ink-4">
                                {formatTime(payment.paidAt, locale)}
                              </span>
                            </div>
                          </TD>
                          <TD>
                            <Link
                              href={`/customers/${payment.customerId}`}
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
                          <TD className="hidden sm:table-cell">
                            <MethodBadge method={payment.method as PaymentMethod} locale={locale} />
                          </TD>
                          <TD align="end">
                            <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">
                              {formatMoney(payment.amount, { locale })}
                            </span>
                          </TD>
                          <TD align="end" className="hidden lg:table-cell">
                            {payment.platformFee > 0 ? (
                              <span className="text-xs tabular-nums text-ink-3">
                                −{formatMoney(payment.platformFee, { locale })}
                              </span>
                            ) : (
                              <span className="text-xs text-ink-4">—</span>
                            )}
                          </TD>
                          <TD>
                            <Badge
                              tone={
                                payment.status === "succeeded"
                                  ? "success"
                                  : payment.status === "pending"
                                    ? "warn"
                                    : payment.status === "failed"
                                      ? "danger"
                                      : "muted"
                              }
                              size="sm"
                            >
                              {payment.status}
                            </Badge>
                          </TD>
                        </TR>
                      );
                    })}
                  </TBody>
                </TableWrap>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <Card>
              <CardHeader title={t("billing.methodMix")} dense />
              <CardBody dense>
                {methodMix.length > 0 ? (
                  <BarList
                    items={methodMix.map((m) => {
                      const max = methodMix[0].amount || 1;
                      return {
                        id: m.method,
                        label: L(paymentMethodLabel[m.method as PaymentMethod], locale),
                        value: formatMoney(m.amount, { locale, compact: true }),
                        ratio: m.amount / max,
                      };
                    })}
                  />
                ) : (
                  <p className="text-xs text-ink-4">{t("billing.paymentsEmpty")}</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardBody dense className="space-y-3">
                <p className="text-xs leading-relaxed text-ink-3">{t("billing.feeExplainer")}</p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {tabParam === "outstanding" && (
        <Card flush>
          <CardHeader
            title={t("billing.outstandingTotal")}
            hint={t("billing.outstandingHint")}
            dense
          />
          {openOrders.length === 0 ? (
            <EmptyState icon={<Receipt className="h-5 w-5" />} title={t("billing.outstandingEmpty")} />
          ) : (
            <TableWrap>
              <THead>
                <TH>{t("billing.invoice")}</TH>
                <TH>{t("common.client")}</TH>
                <TH className="hidden sm:table-cell">{t("common.date")}</TH>
                <TH align="end" className="hidden md:table-cell">{t("common.total")}</TH>
                <TH align="end" className="hidden md:table-cell">{t("common.paid")}</TH>
                <TH align="end">{t("common.balance")}</TH>
                <TH>{t("common.status")}</TH>
              </THead>
              <TBody>
                {openOrders.map((order) => {
                  const customer = customerMap.get(order.customerId);
                  return (
                    <TR key={order.id} interactive>
                      <TD>
                        <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">
                          {order.ref}
                        </span>
                      </TD>
                      <TD>
                        <Link
                          href={`/customers/${order.customerId}`}
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
                      <TD className="hidden sm:table-cell">
                        <span className="text-xs text-ink-3">
                          {formatDate(order.createdAt, locale)}
                        </span>
                      </TD>
                      <TD align="end" className="hidden md:table-cell">
                        <span className="text-[0.8125rem] tabular-nums text-ink-2">
                          {formatMoney(order.total, { locale })}
                        </span>
                      </TD>
                      <TD align="end" className="hidden md:table-cell">
                        <span className="text-xs tabular-nums text-ink-3">
                          {formatMoney(order.paid, { locale })}
                        </span>
                      </TD>
                      <TD align="end">
                        <span className="text-[0.8125rem] font-semibold tabular-nums text-danger">
                          {formatMoney(order.balance, { locale })}
                        </span>
                      </TD>
                      <TD>
                        <OrderStatusBadge status={order.status as "open" | "partially_paid" | "paid" | "refunded" | "void"} locale={locale} />
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </TableWrap>
          )}
        </Card>
      )}

      {tabParam === "payouts" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card flush>
              <CardHeader title={t("billing.tab.payouts")} hint={t("billing.payoutsHint")} dense />
              <TableWrap>
                <THead>
                  <TH>{t("billing.period")}</TH>
                  <TH align="end" className="hidden sm:table-cell">{t("billing.gross")}</TH>
                  <TH align="end" className="hidden sm:table-cell">{t("billing.fees")}</TH>
                  <TH align="end">{t("billing.net")}</TH>
                  <TH className="hidden md:table-cell">{t("billing.expected")}</TH>
                  <TH>{t("common.status")}</TH>
                </THead>
                <TBody>
                  {payouts.map((payout) => (
                    <TR key={payout.id}>
                      <TD>
                        <span className="text-[0.8125rem] font-medium text-ink">
                          {formatDate(payout.periodStart, locale)} — {formatDate(payout.periodEnd, locale)}
                        </span>
                      </TD>
                      <TD align="end" className="hidden sm:table-cell">
                        <span className="text-[0.8125rem] tabular-nums text-ink-2">
                          {formatMoney(payout.gross, { locale })}
                        </span>
                      </TD>
                      <TD align="end" className="hidden sm:table-cell">
                        <span className="text-xs tabular-nums text-ink-3">
                          −{formatMoney(payout.fees, { locale })}
                        </span>
                      </TD>
                      <TD align="end">
                        <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">
                          {formatMoney(payout.net, { locale })}
                        </span>
                      </TD>
                      <TD className="hidden md:table-cell">
                        <span className="text-xs text-ink-3">
                          {formatDate(payout.expectedAt, locale)}
                        </span>
                      </TD>
                      <TD>
                        <Badge
                          tone={
                            payout.status === "paid"
                              ? "success"
                              : payout.status === "processing"
                                ? "info"
                                : "warn"
                          }
                          size="sm"
                        >
                          {L(payoutStatusLabel[payout.status as keyof typeof payoutStatusLabel], locale)}
                        </Badge>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </TableWrap>
            </Card>
          </div>

          <Card>
            <CardHeader title={t("billing.netApp")} dense />
            <CardBody dense className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-ink-3">{t("billing.viaApp")}</span>
                <span className="text-sm font-semibold tabular-nums text-ink">
                  {formatMoney(appCollected, { locale, compact: true })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-ink-3">{t("billing.fees")}</span>
                <span className="text-sm font-semibold tabular-nums text-danger">
                  −{formatMoney(totalFees, { locale, compact: true })}
                </span>
              </div>
              <div className="border-t border-line pt-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-ink-2">{t("billing.net")}</span>
                  <span className="font-display text-lg font-semibold tabular-nums text-ink">
                    {formatMoney(appCollected - totalFees, { locale, compact: true })}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}
