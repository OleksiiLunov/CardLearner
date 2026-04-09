"use client";

import type { ReactNode } from "react";

import { useTranslation } from "@/i18n/useTranslation";

type ListDetailsViewItem = {
  id: string;
  front: string;
  back: string;
};

type ListDetailsViewProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  items: ListDetailsViewItem[];
  actions: ReactNode;
  notices?: ReactNode;
  headerMeta?: ReactNode;
};

export function ListDetailsView({
  eyebrow,
  title,
  description,
  items,
  actions,
  notices,
  headerMeta,
}: ListDetailsViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-7">
      {notices}

      <section className="space-y-6 rounded-[2.25rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
            {headerMeta}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
          <div className="text-sm leading-6 text-muted-foreground">{description}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">{actions}</div>
      </section>

      <section className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.75rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2.5 rounded-[1.25rem] bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("lists.front")}
                </p>
                <p className="text-base font-medium leading-7 text-foreground">{item.front}</p>
              </div>
              <div className="space-y-2.5 rounded-[1.25rem] bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("lists.back")}
                </p>
                <p className="text-base font-medium leading-7 text-foreground">{item.back}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
