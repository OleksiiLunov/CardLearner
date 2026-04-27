"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";

export function ListSummaryCard({
  href,
  name,
  itemCount,
}: {
  href: string;
  name: string;
  itemCount: number;
}) {
  const { t } = useTranslation();

  return (
    <Link
      href={href}
      prefetch
      className="group rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{name}</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {itemCount} {itemCount === 1 ? t("common.item") : t("common.items")}{" "}
            {t("lists.inThisCollection")}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-secondary p-2.5 text-secondary-foreground transition-colors duration-200 group-hover:bg-accent">
          <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
      <p className="mt-6 text-sm font-medium text-foreground/90">{t("lists.viewDetails")}</p>
    </Link>
  );
}
