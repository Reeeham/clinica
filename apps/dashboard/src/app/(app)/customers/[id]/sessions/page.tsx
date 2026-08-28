import { formatDate, formatTime } from "@clinica/core";
import { ClipboardCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { CustomerDetailLayout } from "@/components/customers/CustomerDetailLayout";
import { getCustomerDetail, getEmployees, getServices } from "@/lib/data";

export default async function CustomerSessionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, employeesData, servicesData] = await Promise.all([
    getCustomerDetail(id),
    getEmployees(),
    getServices(),
  ]);
  if (!detail) notFound();

  const { customer, bookings } = detail;
  const employeeMap = new Map(employeesData.items.map((e) => [e.id, e]));
  const serviceMap = new Map(servicesData.items.map((s) => [s.id, s]));

  const sessions = bookings.filter((b) => b.status === "completed" || b.status === "in_progress");

  return (
    <CustomerDetailLayout
      id={id}
      customer={customer}
      bookings={bookings}
      entitlementCount={detail.entitlements.length}
      activeTab="sessions"
    >
      <Card>
        <CardHeader title="Treatment History" dense />
        {sessions.length === 0 ? (
          <EmptyState compact icon={<ClipboardCheck className="h-5 w-5" />} title="No treatment history yet" />
        ) : (
          <div className="divide-y divide-line">
            {sessions.map((booking) => {
              const service = serviceMap.get(booking.serviceId);
              const employee = employeeMap.get(booking.employeeId);
              return (
                <div key={booking.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex w-16 shrink-0 flex-col items-center">
                    <span className="text-[0.8125rem] font-semibold tabular-nums text-ink">
                      {formatTime(booking.startsAt, "en")}
                    </span>
                    <span className="text-2xs tabular-nums text-ink-4">
                      {formatDate(booking.startsAt, "en")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8125rem] font-medium text-ink">
                      {service?.nameEn ?? "—"}
                    </p>
                    <p className="truncate text-xs text-ink-3">
                      {employee?.nameEn ?? "Unassigned"}
                      {booking.notes ? ` · ${booking.notes}` : ""}
                    </p>
                  </div>
                  <StatusBadge
                    status={booking.status as "pending" | "confirmed" | "checked_in" | "in_progress" | "completed" | "no_show" | "cancelled"}
                    locale="en"
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </CustomerDetailLayout>
  );
}
