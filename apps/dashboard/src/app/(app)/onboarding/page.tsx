import { getTranslator } from "@/lib/locale";
import { PageHeader } from "@/components/ui/PageHeader";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const { t } = await getTranslator();

  return (
    <>
      <PageHeader
        title="Onboard New Clinic"
        subtitle="Create a new clinic account with an owner who can log in immediately."
      />
      <OnboardingForm />
    </>
  );
}
