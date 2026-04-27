"use client";

import type { FormEvent } from "react";
import Link from "next/link";

import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { saveNormalStudySessionPayload } from "@/lib/study/storage";
import type { StudyCard } from "@/lib/study/types";

type StudySetupFormProps = {
  hasItems: boolean;
  itemCount: number;
  listName: string;
  normalStudySource?: {
    listId: string;
    items: StudyCard[];
  };
  hiddenFields: Array<{
    name: string;
    value: string;
  }>;
  backHref: string;
};

export function StudySetupForm({
  hasItems,
  itemCount,
  listName,
  normalStudySource,
  hiddenFields,
  backHref,
}: StudySetupFormProps) {
  const { t } = useTranslation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        params.set(key, value);
      }
    }

    const initialSide = params.get("initialSide");
    const order = params.get("order");
    const hasValidInitialSide = initialSide === "front" || initialSide === "back";
    const hasValidOrder = order === "original" || order === "random";

    if (normalStudySource && hasValidInitialSide && hasValidOrder) {
      const storageStartedAt = performance.now();
      saveNormalStudySessionPayload({
        kind: "saved-list",
        listId: normalStudySource.listId,
        listName,
        initialSide,
        order,
        items: normalStudySource.items,
      });
      console.log(`[perf] study:sessionStorage ${Math.round(performance.now() - storageStartedAt)}ms`);
    }

    const navigationStartedAt = performance.now();
    console.log(
      `[perf] start-study:navigation /study/session?${params.toString()} ${Math.round(performance.now() - navigationStartedAt)}ms`,
    );
  }

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

      <form
        action="/study/session"
        onSubmit={handleSubmit}
        className="space-y-6 rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur"
      >
        {hiddenFields.map((field) => (
          <input key={`${field.name}:${field.value}`} type="hidden" name={field.name} value={field.value} />
        ))}

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
            <Link href={backHref}>{t("study.backToList")}</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
