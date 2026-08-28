"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { useLocale } from "@/lib/locale-client";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-raised text-danger">
        <AlertCircle className="h-7 w-7" />
      </span>
      <h1 className="font-display text-xl font-semibold text-ink">
        {t("error.title")}
      </h1>
      <p className="max-w-sm text-sm text-ink-3">{t("error.hint")}</p>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={reset} className={buttonClass({ variant: "primary", size: "md" })}>
          {t("error.title")}
        </button>
        <Link href="/" className={buttonClass({ variant: "secondary", size: "md" })}>
          {t("notFound.action")}
        </Link>
      </div>
    </div>
  );
}
