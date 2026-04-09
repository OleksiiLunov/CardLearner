"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { saveTemporaryFailedList } from "@/features/lists/temp-list-storage";
import type { TemporaryFailedListPayload } from "@/features/lists/types";
import { useTranslation } from "@/i18n/useTranslation";
import { getStudyResultsStorageKey } from "@/lib/study/storage";
import type { StudyResultsPayload } from "@/lib/study/types";

type StudyResultsProps = {
  listId: string;
  listName: string;
  resultsStorageKey?: string;
  studyAgainHref?: string;
  missingBackHref?: string;
};

export function StudyResults({
  listId,
  listName,
  resultsStorageKey = getStudyResultsStorageKey(listId),
  studyAgainHref = `/study/setup?listId=${encodeURIComponent(listId)}`,
  missingBackHref = `/study/setup?listId=${encodeURIComponent(listId)}`,
}: StudyResultsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<StudyResultsPayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const defaultFailedName = useMemo(() => `${listName} ${t("results.failedItemsSuffix")}`.trim(), [listName, t]);

  useEffect(() => {
    const storedValue = sessionStorage.getItem(resultsStorageKey);

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
      sessionStorage.removeItem(resultsStorageKey);
    } finally {
      setLoaded(true);
    }
  }, [listId, resultsStorageKey]);

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
          <Link href={missingBackHref}>{t("results.backToSetup")}</Link>
        </Button>
      </section>
    );
  }

  const fromSetup = searchParams.get("from");

  function handleOpenFailedItems() {
    if (results.failedItems.length === 0) {
      return;
    }

    const payload: TemporaryFailedListPayload = {
      kind: "failed-items",
      title: defaultFailedName,
      items: results.failedItems.map((item) => ({
        id: item.id,
        front: item.front,
        back: item.back,
        position: item.position,
      })),
      itemCount: results.failedItems.length,
      source: {
        listId: results.listId,
        listName: results.listName,
        initialSide: results.initialSide,
        order: results.order,
      },
    };

    saveTemporaryFailedList(payload);
    router.push("/lists/temp/failed");
  }

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
          <button
            type="button"
            onClick={handleOpenFailedItems}
            disabled={results.failedCount === 0}
            aria-label={results.failedCount > 0 ? t("results.openFailedItems") : undefined}
            className={`rounded-[1.5rem] border p-4 text-center shadow-sm transition-all duration-200 ${
              results.failedCount > 0
                ? "cursor-pointer border-red-200 bg-red-50 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70 active:scale-[0.99]"
                : "cursor-default border-red-100 bg-red-50/60 opacity-70"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">{t("results.failed")}</p>
            <p className="mt-2 text-2xl font-semibold text-red-700">{results.failedCount}</p>
          </button>
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
    </div>
  );
}
