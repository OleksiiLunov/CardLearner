"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { FailedListActionState } from "@/app/actions/study";
import { createFailedItemsListAction } from "@/app/actions/study";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n/useTranslation";
import type { StudyResultsPayload } from "@/lib/study/types";

type StudyResultsProps = {
  listId: string;
  listName: string;
};

const initialState: FailedListActionState = {};

function getResultsStorageKey(listId: string) {
  return `study-results:${listId}`;
}

export function StudyResults({ listId, listName }: StudyResultsProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<StudyResultsPayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [state, formAction] = useActionState(createFailedItemsListAction, initialState);
  const defaultFailedName = useMemo(() => `${listName} - ${t("results.failedItemsSuffix")}`, [listName, t]);

  useEffect(() => {
    const storedValue = sessionStorage.getItem(getResultsStorageKey(listId));

    if (!storedValue) {
      setLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(storedValue) as StudyResultsPayload;
      if (parsed.listId === listId) {
        setResults(parsed);
      }
    } catch {
      sessionStorage.removeItem(getResultsStorageKey(listId));
    } finally {
      setLoaded(true);
    }
  }, [listId]);

  if (!loaded) {
    return (
      <section className="rounded-[2rem] border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur">
        <p className="text-sm text-muted-foreground">{t("results.loading")}</p>
      </section>
    );
  }

  if (!results) {
    return (
      <section className="space-y-4 rounded-[2rem] border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("results.noResultsTitle")}</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("results.noResultsDescription")}
        </p>
        <Button asChild className="w-full">
          <Link href={`/study/setup?listId=${encodeURIComponent(listId)}`}>{t("results.backToSetup")}</Link>
        </Button>
      </section>
    );
  }

  const studyAgainHref = `/study/setup?listId=${encodeURIComponent(listId)}`;
  const itemsJson = JSON.stringify(results.failedItems);
  const prefillName = state.values?.name ?? defaultFailedName;
  const fromSetup = searchParams.get("from");
  const formKey = `${prefillName}:${itemsJson}`;

  return (
    <div className="space-y-7">
      <section className="space-y-6 rounded-[2.25rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("results.eyebrow")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground">
            {results.listName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {fromSetup ? t("results.completedDescription") : t("results.sessionSummary")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[1.5rem] bg-background/90 p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("results.total")}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{results.totalItems}</p>
          </div>
          <div className="rounded-[1.5rem] bg-background/90 p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("results.guessed")}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{results.guessedCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">{t("results.failed")}</p>
            <p className="mt-2 text-2xl font-semibold text-red-700">{results.failedCount}</p>
          </div>
        </div>

        <div className="grid gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href={studyAgainHref}>{t("results.studyAgain")}</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href="/lists">{t("results.backToLists")}</Link>
          </Button>
        </div>
      </section>

      {results.failedCount > 0 ? (
        <section className="space-y-5 rounded-[2.25rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="space-y-2.5">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {t("results.createFailedListTitle")}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {t("results.createFailedListDescription")}
            </p>
          </div>

          <form key={formKey} action={formAction} className="space-y-4">
            <input type="hidden" name="itemsJson" value={itemsJson} />

            <div className="space-y-2.5">
              <Label htmlFor="name">{t("results.newListName")}</Label>
              <Input id="name" name="name" defaultValue={prefillName} required />
            </div>

            {state.error || state.errorKey ? (
              <p className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {state.error ?? t(state.errorKey!)}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full">
              {t("results.createFailedList")}
            </Button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
