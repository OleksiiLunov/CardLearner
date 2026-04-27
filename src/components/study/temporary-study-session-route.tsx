"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { StudySession } from "@/components/study/study-session";
import { TemporaryStudyFallback } from "@/components/study/temporary-study-fallback";
import { useTranslation } from "@/i18n/useTranslation";
import {
  getTemporaryStudyFallbackHref,
  getTemporaryStudyResultsStorageKey,
  isTemporaryStudySourceQueryValue,
  readTemporaryStudy,
  TEMP_FAILED_STUDY_QUERY_VALUE,
} from "@/lib/study/temp-study-storage";
import type { StudyInitialSide, StudyOrder, TemporaryStudyPayload } from "@/lib/study/types";

export function TemporaryStudySessionRoute() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<TemporaryStudyPayload | null>(null);
  const [loaded, setLoaded] = useState(false);

  const initialSide = searchParams.get("initialSide");
  const order = searchParams.get("order");
  const source = searchParams.get("source");

  useEffect(() => {
    const startedAt = performance.now();
    const stored = readTemporaryStudy();
    console.log(`[perf] start-study:prepareSession ${Math.round(performance.now() - startedAt)}ms`);
    setPayload(stored);
    setLoaded(true);

    const currentSource =
      stored && isTemporaryStudySourceQueryValue(stored.source.queryValue)
        ? stored.source.queryValue
        : isTemporaryStudySourceQueryValue(source)
          ? source
          : TEMP_FAILED_STUDY_QUERY_VALUE;

    if (initialSide !== "front" && initialSide !== "back") {
      router.replace(`/study/setup?source=${encodeURIComponent(currentSource)}`);
      return;
    }

    if (order !== "original" && order !== "random") {
      router.replace(`/study/setup?source=${encodeURIComponent(currentSource)}`);
    }
  }, [initialSide, order, router, source]);

  useEffect(() => {
    if (loaded && payload && payload.items.length === 0) {
      router.replace(`/study/setup?source=${encodeURIComponent(payload.source.queryValue)}`);
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
    return (
      <TemporaryStudyFallback
        backHref={getTemporaryStudyFallbackHref(
          isTemporaryStudySourceQueryValue(source) ? source : null,
        )}
      />
    );
  }

  const currentPayload = payload;

  if ((initialSide !== "front" && initialSide !== "back") || (order !== "original" && order !== "random")) {
    return null;
  }

  if (currentPayload.items.length === 0) {
    return null;
  }

  return (
    <StudySession
      listId={currentPayload.source.sourceId}
      listName={currentPayload.title}
      initialSide={initialSide as StudyInitialSide}
      order={order as StudyOrder}
      items={currentPayload.items}
      resultsStorageKey={getTemporaryStudyResultsStorageKey(currentPayload.source.sourceId)}
      resultsHref={`/study/results?source=${encodeURIComponent(currentPayload.source.queryValue)}`}
    />
  );
}
