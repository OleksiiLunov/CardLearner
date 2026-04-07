"use client";

import Link from "next/link";

import { useTranslation } from "@/i18n/useTranslation";

type PlaceholderScreenProps = {
  badge: string;
  title: string;
  description: string;
  primaryAction?: {
    href: string;
    label: string;
  };
};

export function PlaceholderScreen({
  badge,
  title,
  description,
  primaryAction,
}: PlaceholderScreenProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-6 rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
      <div className="space-y-4">
        <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
          {badge}
        </span>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
        {t("ui.placeholderScreen")}
      </div>

      {primaryAction ? (
        <Link
          href={primaryAction.href}
          className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          {primaryAction.label}
        </Link>
      ) : null}
    </section>
  );
}
