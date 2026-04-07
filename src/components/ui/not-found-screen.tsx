"use client";

import Link from "next/link";

import { useTranslation } from "@/i18n/useTranslation";

export function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <section className="space-y-6 rounded-[2rem] border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur">
        <div className="space-y-3">
          <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
            404
          </span>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              {t("errors.notFoundTitle")}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {t("errors.notFoundDescription")}
            </p>
          </div>
        </div>
        <Link
          href="/lists"
          className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          {t("errors.goHome")}
        </Link>
      </section>
    </div>
  );
}
