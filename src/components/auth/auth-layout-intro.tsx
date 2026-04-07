"use client";

import { useTranslation } from "@/i18n/useTranslation";

export function AuthLayoutIntro() {
  const { t } = useTranslation();

  return (
    <div className="mb-8 space-y-3 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {t("common.appName")}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-balance">
        {t("auth.introTitle")}
      </h1>
      <p className="text-sm leading-6 text-muted-foreground">{t("auth.introDescription")}</p>
    </div>
  );
}
