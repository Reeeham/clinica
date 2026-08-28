import { PageHeader } from "@/components/ui/PageHeader";
import { TabLinks } from "@/components/ui/Tabs";
import { getTranslator } from "@/lib/locale";
import { CatalogManager } from "@/components/catalog/CatalogManager";
import { getServices, getPackages, getOffers } from "@/lib/data";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, t } = await getTranslator();
  const params = await searchParams;

  const tabParam = typeof params.tab === "string" ? params.tab : "services";

  const [servicesData, packagesData, offersData] = await Promise.all([
    getServices(),
    getPackages(),
    getOffers(),
  ]);

  const tabs = [
    { href: "/catalog?tab=services", label: t("catalog.tab.services"), active: tabParam === "services" },
    { href: "/catalog?tab=packages", label: t("catalog.tab.packages"), active: tabParam === "packages" },
    { href: "/catalog?tab=offers", label: t("catalog.tab.offers"), active: tabParam === "offers" },
  ];

  return (
    <>
      <PageHeader title={t("catalog.title")} subtitle={t("catalog.subtitle")} />

      <div className="mb-6">
        <TabLinks items={tabs} />
      </div>

      <CatalogManager
        tab={tabParam}
        locale={locale}
        services={servicesData.items}
        packages={packagesData.items}
        offers={offersData.items}
      />
    </>
  );
}
