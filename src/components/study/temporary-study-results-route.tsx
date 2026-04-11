"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { StudyResults } from "@/components/study/study-results";
import { TemporaryStudyFallback } from "@/components/study/temporary-study-fallback";
import { useTranslation } from "@/i18n/useTranslation";
import {
  getTemporaryStudyFallbackHref,
  getTemporaryStudyResultsStorageKey,
  isTemporaryStudySourceQueryValue,
  readTemporaryStudy,
} from "@/lib/study/temp-study-storage";
import type { TemporaryStudyPayload } from "@/lib/study/types";

export function TemporaryStudyResultsRoute() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<TemporaryStudyPayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const source = searchParams.get("source");

  useEffect(() => {
    setPayload(readTemporaryStudy());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <section className="rounded-[2rem] border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </section>
    );
  }

  if (!payload) {
    return (
      <TemporaryStudyFallback
        backHref={getTemporaryStudyFallbackHref(
          isTemporaryStudySourceQueryValue(source) ? source : null,
        )}
      />
    );
  }

  const currentPayload = payload;

  return (
    <StudyResults
      listId={currentPayload.source.sourceId}
      listName={currentPayload.title}
      resultsStorageKey={getTemporaryStudyResultsStorageKey(currentPayload.source.sourceId)}
      studyAgainHref={`/study/setup?source=${encodeURIComponent(currentPayload.source.queryValue)}`}
      missingBackHref={currentPayload.source.backHref}
    />
  );
}
