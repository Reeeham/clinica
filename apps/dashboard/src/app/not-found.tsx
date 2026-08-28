import { FileQuestion } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { getTranslator } from "@/lib/locale";
import Link from "next/link";

export default async function NotFound() {
  const { t } = await getTranslator();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-surface text-ink-3">
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
