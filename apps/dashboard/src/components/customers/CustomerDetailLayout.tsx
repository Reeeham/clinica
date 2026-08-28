import { formatPhone } from "@clinica/core";
import { Phone, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass } from "@/components/ui/Button";
import { TabRail } from "@/components/ui/Tabs";
import { getTranslator } from "@/lib/locale";
import Link from "next/link";
import type { CustomerData, BookingData } from "@/lib/data";

export async function CustomerDetailLayout({
  id,
  customer,
  bookings,
  entitlementCount,
  activeTab,
  children,
}: {
  id: string;
  customer: CustomerData;
  bookings: BookingData[];
  entitlementCount: number;
  activeTab: "overview" | "sessions" | "packages" | "billing" | "notes";
  children: React.ReactNode;
}) {
  const { locale, t } = await getTranslator();

  const tabs = [
    { href: `/customers/${id}`, label: t("customers.tab.overview"), active: activeTab === "overview" },
    { href: `/customers/${id}/sessions`, label: t("customers.tab.sessions"), active: activeTab === "sessions", count: bookings.filter(b => b.status === "completed").length },
    { href: `/customers/${id}/packages`, label: t("customers.tab.packages"), active: activeTab === "packages", count: entitlementCount },
    { href: `/customers/${id}/billing`, label: t("customers.tab.billing"), active: activeTab === "billing", count: 0 },
    { href: `/customers/${id}/notes`, label: t("customers.tab.notes"), active: activeTab === "notes" },
  ];

  return (
    <>
      <PageHeader
        backHref="/customers"
        backLabel={t("nav.customers")}
        title={
          <span className="flex items-center gap-3">
            <Avatar initials={customer.initials} color={customer.color} size="md" />
            {locale === "ar" ? customer.nameAr : customer.nameEn}
          </span>
        }
        subtitle={formatPhone(customer.phone)}
        actions={
          <div className="flex items-center gap-2">
            <a
              href={`tel:${customer.phone}`}
              className={buttonClass({ variant: "secondary", size: "sm", icon: true })}
              aria-label={t("action.call")}
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={`https://wa.me/2${customer.phone.replace(/^0/, "")}`}
              className={buttonClass({ variant: "secondary", size: "sm", icon: true })}
              aria-label={t("action.whatsapp")}
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <Link href="/bookings?new=1" className={buttonClass({ variant: "primary", size: "sm" })}>
              {t("action.book")}
            </Link>
          </div>
        }
      />

      <div className="mb-6">
        <TabRail items={tabs} />
      </div>

      {children}
    </>
  );
}
