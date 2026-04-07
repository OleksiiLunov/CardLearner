"use client";

import Link from "next/link";

import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/button";

type StudySetupFormProps = {
  hasItems: boolean;
  itemCount: number;
  listId: string;
  listName: string;
};

export function StudySetupForm({
  hasItems,
  itemCount,
  listId,
  listName,
}: StudySetupFormProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("study.setupEyebrow")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground">
            {listName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? t("common.item") : t("common.items")}{" "}
            {t("study.readyForReview")}
          </p>
        </div>
      </section>

      <form action="/study/session" className="space-y-6 rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
        <input type="hidden" name="listId" value={listId} />

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">{t("study.initialSide")}</legend>
          <label className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-background px-4 py-3">
            <input type="radio" name="initialSide" value="front" defaultChecked />
            <span className="text-sm text-foreground">{t("study.frontFirst")}</span>
          </label>
          <label className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-background px-4 py-3">
            <input type="radio" name="initialSide" value="back" />
            <span className="text-sm text-foreground">{t("study.backFirst")}</span>
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">{t("study.order")}</legend>
          <label className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-background px-4 py-3">
            <input type="radio" name="order" value="original" defaultChecked />
            <span className="text-sm text-foreground">{t("study.original")}</span>
          </label>
          <label className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-background px-4 py-3">
            <input type="radio" name="order" value="random" />
            <span className="text-sm text-foreground">{t("study.random")}</span>
          </label>
        </fieldset>

        {!hasItems ? (
          <p className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {t("study.emptyListWarning")}
          </p>
        ) : null}

        <div className="grid gap-3">
          <Button type="submit" className="w-full" disabled={!hasItems}>
            {t("study.start")}
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href={`/lists/${listId}`}>{t("study.backToList")}</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
