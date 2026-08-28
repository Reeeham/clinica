import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { TabLinks } from "@/components/ui/Tabs";
import { getTranslator } from "@/lib/locale";
import { getClinicSettings } from "@/lib/data";
import { SettingsForms } from "./SettingsForms";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, t } = await getTranslator();
  const params = await searchParams;

  const tabParam = typeof params.tab === "string" ? params.tab : "profile";
  const clinic = await getClinicSettings();

  if (!clinic) {
    return (
      <>
        <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
        <Card>
          <CardBody dense>
            <p className="text-sm text-ink-3">Unable to load clinic settings.</p>
          </CardBody>
        </Card>
      </>
    );
  }

  const tabs = [
    { href: "/settings?tab=profile", label: t("settings.tab.profile"), active: tabParam === "profile" },
    { href: "/settings?tab=hours", label: t("settings.tab.hours"), active: tabParam === "hours" },
    { href: "/settings?tab=rooms", label: t("settings.tab.rooms"), active: tabParam === "rooms" },
    { href: "/settings?tab=app", label: t("settings.tab.app"), active: tabParam === "app" },
    { href: "/settings?tab=plan", label: t("settings.tab.plan"), active: tabParam === "plan" },
  ];

  return (
    <>
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <div className="mb-6">
        <TabLinks items={tabs} />
      </div>

      <SettingsForms tab={tabParam} clinic={clinic} locale={locale} t={t} />
    </>
  );
}
