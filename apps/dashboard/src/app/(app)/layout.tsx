import { employeeRoleLabel, formatMoney, formatDateLong, todayISO } from "@clinica/core";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import type { PaletteItem } from "@/components/layout/CommandPalette";
import { L } from "@/lib/i18n";
import { getTranslator } from "@/lib/locale";
import {
  getClinicSettings,
  getEmployees,
  getCustomers,
  getServices,
  getPackages,
  getTodaySnapshot,
  getOutstanding,
} from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getTranslator();

  const [clinic, employeesData, customersData, servicesData, packagesData, snapshot, outstandingData] = await Promise.all([
    getClinicSettings(),
    getEmployees(),
    getCustomers(),
    getServices(),
    getPackages(),
    getTodaySnapshot(),
    getOutstanding(),
  ]);

  const owner = employeesData.items[0];

  const paletteItems: PaletteItem[] = [
    ...customersData.items.map((customer) => ({
      kind: "customer" as const,
      id: customer.id,
      title: locale === "ar" ? customer.nameAr : customer.nameEn,
      subtitle: customer.phone,
      href: `/customers/${customer.id}`,
    })),
    ...employeesData.items.map((employee) => ({
      kind: "employee" as const,
      id: employee.id,
      title: locale === "ar" ? employee.nameAr : employee.nameEn,
      subtitle: locale === "ar" ? employee.titleAr : employee.titleEn,
      href: `/team/${employee.id}`,
    })),
    ...servicesData.items.map((service) => ({
      kind: "service" as const,
      id: service.id,
      title: locale === "ar" ? service.nameAr : service.nameEn,
      subtitle: formatMoney(service.price, { locale }),
      href: `/catalog?tab=services&focus=${service.id}`,
    })),
    ...packagesData.items.map((pkg) => ({
      kind: "package" as const,
      id: pkg.id,
      title: locale === "ar" ? pkg.nameAr : pkg.nameEn,
      subtitle: formatMoney(pkg.price, { locale }),
      href: `/catalog?tab=packages&focus=${pkg.id}`,
    })),
  ];

  const pending = snapshot?.awaitingConfirmation ?? 0;
  const outstanding = (outstandingData.items as Array<{ balance?: number }>).reduce(
    (total, order) => total + Math.max(0, order.balance ?? 0),
    0,
  );
  const due = 0;

  const alerts = [
    pending > 0
      ? {
          title:
            locale === "ar"
              ? `${pending} حجز بانتظار التأكيد`
              : `${pending} bookings awaiting confirmation`,
          hint: locale === "ar" ? "من حجوزات اليوم" : "From today's schedule",
          href: "/bookings?status=pending",
        }
      : null,
    due > 0
      ? {
          title:
            locale === "ar" ? `${due} عميلة بحاجة لمتابعة` : `${due} clients due a follow-up`,
          hint: t("overview.followUpsHint"),
          href: "/customers?status=lapsed",
        }
      : null,
    outstanding > 0
      ? {
          title: `${formatMoney(outstanding, { locale })} ${locale === "ar" ? "متأخرات" : "outstanding"}`,
          hint: t("billing.outstandingHint"),
          href: "/billing?tab=outstanding",
        }
      : null,
  ].filter(Boolean) as { title: string; hint: string; href: string }[];

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar
          clinicName={clinic ? (locale === "ar" ? clinic.nameAr : clinic.nameEn) : "Clinica"}
          clinicArea={clinic ? (locale === "ar" ? clinic.areaAr : clinic.areaEn) : ""}
          plan={clinic?.plan ?? "starter"}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={{
            name: owner ? (locale === "ar" ? owner.nameAr : owner.nameEn) : "",
            role: owner ? L(employeeRoleLabel[owner.role as keyof typeof employeeRoleLabel], locale) : "",
            initials: owner?.initials ?? "",
            color: owner?.color ?? "#7A2F5F",
          }}
          clinicName={clinic ? (locale === "ar" ? clinic.nameAr : clinic.nameEn) : "Clinica"}
          clinicArea={clinic ? (locale === "ar" ? clinic.areaAr : clinic.areaEn) : ""}
          plan={clinic?.plan ?? "starter"}
          paletteItems={paletteItems}
          dateLabel={formatDateLong(todayISO(), locale)}
          alerts={alerts}
        />
        <main className="canvas-grain flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[92rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
