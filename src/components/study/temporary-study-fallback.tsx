"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";

type TemporaryStudyFallbackProps = {
  backHref: string;
};

export function TemporaryStudyFallback({ backHref }: TemporaryStudyFallbackProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4 rounded-[2rem] border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {t("study.tempMissingTitle")}
      </h1>
      <p className="text-sm leading-6 text-muted-foreground">
        {t("study.tempMissingDescription")}
      </p>
      <Button asChild className="w-full">
        <Link href={backHref}>{t("study.backToTempList")}</Link>
      </Button>
    </section>
  );
}
