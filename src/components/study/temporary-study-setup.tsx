"use client";

import { useEffect, useState } from "react";

import { StudySetupForm } from "@/components/study/study-setup-form";
import { TemporaryStudyFallback } from "@/components/study/temporary-study-fallback";
import { readTemporaryStudy, TEMP_FAILED_STUDY_QUERY_VALUE } from "@/lib/study/temp-study-storage";
import type { TemporaryStudyPayload } from "@/lib/study/types";
import { useTranslation } from "@/i18n/useTranslation";

export function TemporaryStudySetup() {
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
    <StudySetupForm
      hasItems={currentPayload.items.length > 0}
      itemCount={currentPayload.items.length}
      listName={currentPayload.title}
      hiddenFields={[{ name: "source", value: TEMP_FAILED_STUDY_QUERY_VALUE }]}
      backHref="/lists/temp/failed"
    />
  );
}
