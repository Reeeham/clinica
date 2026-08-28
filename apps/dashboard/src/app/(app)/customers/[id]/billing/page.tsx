import { formatMoney, formatDate } from "@clinica/core";
import { Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableWrap, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { CustomerDetailLayout } from "@/components/customers/CustomerDetailLayout";
import { getCustomerDetail } from "@/lib/data";

export default async function CustomerBillingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getCustomerDetail(id);
  if (!detail) notFound();

  const { customer, bookings } = detail;
  const stats = detail.stats as { lifetimeValue?: number; outstanding?: number };

  const lifetimeValue = stats?.lifetimeValue ?? bookings.reduce((sum, b) => sum + (b.price ?? 0), 0);
  const outstanding = stats?.outstanding ?? 0;

  return (
    <CustomerDetailLayout
      id={id}
      customer={customer}
      bookings={bookings}
      entitlementCount={detail.entitlements.length}
      activeTab="billing"
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardBody dense>
            <p className="text-2xs font-semibold uppercase tracking-wide text-ink-4">Lifetime Value</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">
              {formatMoney(lifetimeValue, { locale: "en", compact: true })}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody dense>
            <p className="text-2xs font-semibold uppercase tracking-wide text-ink-4">Outstanding</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">
              {formatMoney(outstanding, { locale: "en", compact: true })}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody dense>
            <p className="text-2xs font-semibold uppercase tracking-wide text-ink-4">Total Bookings</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">
              {bookings.length}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card flush>
        <CardHeader title="Booking Charges" dense />
        {bookings.length === 0 ? (
          <EmptyState compact icon={<Wallet className="h-5 w-5" />} title="No billing history yet" />
        ) : (
          <TableWrap>
            <THead>
              <TH>Date</TH>
              <TH>Ref</TH>
              <TH>Status</TH>
              <TH align="end">Price</TH>
            </THead>
            <TBody>
              {bookings.map((b) => (
                <TR key={b.id}>
                  <TD>
                    <span className="text-xs tabular-nums text-ink-3">
                      {formatDate(b.startsAt, "en")}
                    </span>
                  </TD>
                  <TD>
                    <span className="text-xs font-medium text-ink-2">{b.ref}</span>
                  </TD>
                  <TD>
                    <Badge tone="neutral" size="sm">{b.status}</Badge>
                  </TD>
                  <TD align="end">
                    <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">
                      {formatMoney(b.price ?? 0, { locale: "en" })}
                    </span>
                  </TD>
                </TR>
              ))}
            </TBody>
          </TableWrap>
        )}
      </Card>
    </CustomerDetailLayout>
  );
}
