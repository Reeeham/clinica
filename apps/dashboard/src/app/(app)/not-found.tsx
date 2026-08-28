import { FileQuestion } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { L } from "@/lib/i18n";
import { getTranslator } from "@/lib/locale";
import Link from "next/link";

export default async function NotFound() {
  const { locale, t } = await getTranslator();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-raised text-ink-3">
        <FileQuestion className="h-7 w-7" />
      </span>
      <h1 className="font-display text-xl font-semibold text-ink">
        {t("notFound.title")}
      </h1>
      <p className="max-w-sm text-sm text-ink-3">{t("notFound.hint")}</p>
      <Link href="/" className={buttonClass({ variant: "primary", size: "md" })}>
        {t("notFound.action")}
      </Link>
    </div>
  );
}
