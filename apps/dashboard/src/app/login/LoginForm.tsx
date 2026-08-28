"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { L } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-client";
import { buttonClass } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { loginAction } from "@/lib/auth-actions";

export function LoginForm({ clinicName, clinicTagline, clinicPalette }: {
  clinicName: { en: string; ar: string };
  clinicTagline: { en: string; ar: string };
  clinicPalette: [string, string];
}) {
  const { locale, t } = useLocale();
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await loginAction(formData);
    },
    null,
  );

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="font-display text-2xl font-bold text-ink">{t("app.name")}</p>
            <p className="mt-1 text-sm text-ink-3">{t("app.suite")}</p>
          </div>

          <h1 className="font-display text-[1.5rem] font-semibold text-ink">
            {t("auth.welcome")}
          </h1>
          <p className="mt-2 text-sm text-ink-3">{t("auth.subtitle")}</p>

          <form action={formAction} className="mt-8 space-y-4">
            <Field label={t("auth.email")}>
              <Input
                type="email"
                name="email"
                placeholder="you@clinic.com"
                required
              />
            </Field>
            <Field label={t("auth.password")}>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </Field>

            {state?.error ? (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
                {state.error}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-ink-3">
                <input type="checkbox" className="h-4 w-4 rounded border-line-strong" defaultChecked />
                {t("auth.remember")}
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={buttonClass({ variant: "primary", size: "lg", className: "w-full" })}
            >
              {isPending ? "…" : t("auth.signIn")}
            </button>
          </form>
        </div>
      </div>

      <div
        className="hidden items-center justify-center p-12 lg:flex"
        style={{
          background: `linear-gradient(135deg, ${clinicPalette[0]}, ${clinicPalette[1]})`,
        }}
      >
        <div className="max-w-md text-white">
          <p className="font-display text-3xl font-bold leading-tight">
            {t("auth.pitch")}
          </p>
          <ul className="mt-8 space-y-4">
            {[t("auth.pitch1"), t("auth.pitch2"), t("auth.pitch3")].map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/20">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm leading-relaxed text-white/90">{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-xl bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm font-semibold">{L(clinicName, locale)}</p>
            <p className="mt-1 text-sm text-white/70">{L(clinicTagline, locale)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
