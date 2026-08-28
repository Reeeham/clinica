import { formatDate } from "@clinica/core";
import { Package as PackageIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { CustomerDetailLayout } from "@/components/customers/CustomerDetailLayout";
import { getCustomerDetail } from "@/lib/data";
import { L } from "@/lib/i18n";
import { entitlementStatusLabel } from "@clinica/core";

export default async function CustomerPackagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getCustomerDetail(id);
  if (!detail) notFound();

  const { customer, bookings, entitlements } = detail;

  return (
    <CustomerDetailLayout
      id={id}
      customer={customer}
      bookings={bookings}
      entitlementCount={entitlements.length}
      activeTab="packages"
    >
      <Card>
        <CardHeader title="Packages & Entitlements" dense />
        {entitlements.length === 0 ? (
          <EmptyState compact icon={<PackageIcon className="h-5 w-5" />} title="No packages purchased" />
        ) : (
          <div className="divide-y divide-line">
            {entitlements.map((ent: any) => {
              const used = ent.balance?.reduce((a: number, b: any) => a + b.used, 0) ?? 0;
              const total = ent.balance?.reduce((a: number, b: any) => a + b.total, 0) ?? 0;
              const remaining = total - used;
              return (
                <div key={ent.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.8125rem] font-medium text-ink">
                      Package {ent.packageId?.slice(0, 8)}
                    </p>
                    <Badge tone="neutral" size="sm">
                      {L(entitlementStatusLabel[ent.status as keyof typeof entitlementStatusLabel] ?? { en: ent.status, ar: ent.status }, "en")}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-2xs text-ink-3">
                      {remaining} sessions remaining
                    </span>
                    <span className="ms-auto text-2xs text-ink-4">
                      Expires {formatDate(ent.expiresAt, "en")}
                    </span>
                  </div>
                  {total > 0 ? (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${total > 0 ? (used / total) * 100 : 0}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </CustomerDetailLayout>
  );
}
