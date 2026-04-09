"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { StudySession } from "@/components/study/study-session";
import { TemporaryStudyFallback } from "@/components/study/temporary-study-fallback";
import { useTranslation } from "@/i18n/useTranslation";
import { getTemporaryStudyResultsStorageKey, readTemporaryStudy, TEMP_FAILED_STUDY_QUERY_VALUE, TEMP_FAILED_STUDY_SOURCE_ID } from "@/lib/study/temp-study-storage";
import type { StudyInitialSide, StudyOrder, TemporaryStudyPayload } from "@/lib/study/types";

export function TemporaryStudySessionRoute() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<TemporaryStudyPayload | null>(null);
  const [loaded, setLoaded] = useState(false);

  const initialSide = searchParams.get("initialSide");
  const order = searchParams.get("order");

  useEffect(() => {
    const stored = readTemporaryStudy();
    setPayload(stored);
    setLoaded(true);

    if (initialSide !== "front" && initialSide !== "back") {
      router.replace(`/study/setup?source=${encodeURIComponent(TEMP_FAILED_STUDY_QUERY_VALUE)}`);
      return;
    }

    if (order !== "original" && order !== "random") {
      router.replace(`/study/setup?source=${encodeURIComponent(TEMP_FAILED_STUDY_QUERY_VALUE)}`);
    }
  }, [initialSide, order, router]);

  useEffect(() => {
    if (loaded && payload && payload.items.length === 0) {
      router.replace(`/study/setup?source=${encodeURIComponent(TEMP_FAILED_STUDY_QUERY_VALUE)}`);
    }
  }, [loaded, payload, router]);

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

  if ((initialSide !== "front" && initialSide !== "back") || (order !== "original" && order !== "random")) {
    return null;
  }

  if (payload.items.length === 0) {
    return null;
  }

  return (
    <StudySession
      listId={TEMP_FAILED_STUDY_SOURCE_ID}
      listName={payload.title}
      initialSide={initialSide as StudyInitialSide}
      order={order as StudyOrder}
      items={payload.items}
      resultsStorageKey={getTemporaryStudyResultsStorageKey()}
      resultsHref={`/study/results?source=${encodeURIComponent(TEMP_FAILED_STUDY_QUERY_VALUE)}`}
    />
  );
}
