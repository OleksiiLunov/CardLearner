"use client";

import Link from "next/link";

import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { ListSummaryCard } from "@/components/lists/list-summary-card";
import { SectionIntro } from "@/components/ui/section-intro";

type ListsOverviewProps = {
  deleted: boolean;
  lists: Array<{
    id: string;
    name: string;
    items: Array<{ id: string }>;
  }>;
  userEmail?: string | null;
};

export function ListsOverview({ deleted, lists, userEmail }: ListsOverviewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-7">
      <SectionIntro
        eyebrow={t("lists.overviewEyebrow")}
        title={t("lists.overviewTitle")}
        description={t("lists.overviewDescription")}
      />

      {deleted ? (
        <p className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t("lists.deletedSuccess")}
        </p>
      ) : null}

      <div className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">{t("lists.collections")}</p>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              {t("common.signedInAs")} {userEmail ?? t("common.unknownUser")}.{" "}
              {t("lists.databaseScopeDescription")}
            </p>
          </div>
          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link href="/lists/new">{t("lists.createList")}</Link>
          </Button>
        </div>
      </div>

      {lists.length === 0 ? (
        <section className="rounded-[2.25rem] border border-dashed border-border bg-card/70 p-6 text-center shadow-sm backdrop-blur">
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {t("lists.emptyTitle")}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {t("lists.emptyDescription")}
              </p>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href="/lists/new">{t("lists.createFirstList")}</Link>
            </Button>
          </div>
        </section>
      ) : (
        <div className="grid gap-4">
          {lists.map((list) => (
            <ListSummaryCard
              key={list.id}
              href={`/lists/${list.id}`}
              name={list.name}
              itemCount={list.items.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
