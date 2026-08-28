import { AlertTriangle, StickyNote } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { CustomerDetailLayout } from "@/components/customers/CustomerDetailLayout";
import { getCustomerDetail } from "@/lib/data";

export default async function CustomerNotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getCustomerDetail(id);
  if (!detail) notFound();

  const { customer, bookings } = detail;

  return (
    <CustomerDetailLayout
      id={id}
      customer={customer}
      bookings={bookings}
      entitlementCount={detail.entitlements.length}
      activeTab="notes"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Allergies" dense />
          <CardBody dense>
            {customer.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {customer.allergies.map((a, i) => (
                  <Badge key={i} tone="danger" size="sm">
                    <AlertTriangle className="h-3 w-3" /> {a}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-3">No known allergies</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Conditions" dense />
          <CardBody dense>
            {customer.conditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {customer.conditions.map((c, i) => (
                  <Badge key={i} tone="warn" size="sm">
                    <AlertTriangle className="h-3 w-3" /> {c}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-3">No known conditions</p>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Notes" dense />
          <CardBody dense>
            {customer.notes ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-2">{customer.notes}</p>
            ) : (
              <EmptyState compact icon={<StickyNote className="h-5 w-5" />} title="No notes recorded" />
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Booking Notes" dense />
          <CardBody dense>
            {bookings.filter((b) => b.notes).length === 0 ? (
              <p className="text-sm text-ink-3">No booking-specific notes</p>
            ) : (
              <div className="space-y-3">
                {bookings.filter((b) => b.notes).map((b) => (
                  <div key={b.id} className="rounded-lg border border-line bg-raised p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-ink-2">{b.ref}</span>
                      <span className="text-2xs text-ink-4">{b.status}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-ink-2">{b.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </CustomerDetailLayout>
  );
}
