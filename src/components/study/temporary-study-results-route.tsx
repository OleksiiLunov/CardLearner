"use client";

import { useEffect, useState } from "react";

import { StudyResults } from "@/components/study/study-results";
import { TemporaryStudyFallback } from "@/components/study/temporary-study-fallback";
import { useTranslation } from "@/i18n/useTranslation";
import { getTemporaryStudyResultsStorageKey, readTemporaryStudy, TEMP_FAILED_STUDY_QUERY_VALUE, TEMP_FAILED_STUDY_SOURCE_ID } from "@/lib/study/temp-study-storage";
import type { TemporaryStudyPayload } from "@/lib/study/types";

export function TemporaryStudyResultsRoute() {
  const { t } = useTranslation();
  const [payload, setPayload] = useState<TemporaryStudyPayload | null>(null);
  const [loaded, setLoaded] = useState(false);

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
    return <TemporaryStudyFallback backHref="/lists/temp/failed" />;
  }

  const currentPayload = payload;

  return (
    <StudyResults
      listId={TEMP_FAILED_STUDY_SOURCE_ID}
      listName={currentPayload.title}
      resultsStorageKey={getTemporaryStudyResultsStorageKey()}
      studyAgainHref={`/study/setup?source=${encodeURIComponent(TEMP_FAILED_STUDY_QUERY_VALUE)}`}
      missingBackHref="/lists/temp/failed"
    />
  );
}
