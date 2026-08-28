import { getTranslator } from "@/lib/locale";
import { getClinicSettings } from "@/lib/data";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  await getTranslator();
  const clinic = await getClinicSettings();

  return (
    <LoginForm
      clinicName={clinic ? { en: clinic.nameEn, ar: clinic.nameAr } : { en: "Clinica", ar: "كلينيكا" }}
      clinicTagline={clinic ? { en: clinic.taglineEn, ar: clinic.taglineAr } : { en: "", ar: "" }}
      clinicPalette={(clinic?.palette ?? ["#6C5CE7", "#A29BFE"]) as [string, string]}
    />
  );
}
