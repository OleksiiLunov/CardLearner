"use client";
import Link from "next/link";
import { useTransition } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { saveTemporaryFailedListAction } from "@/app/actions/lists";
import { ListDetailsView } from "@/components/lists/list-details-view";
import { Button } from "@/components/ui/button";
import { clearTemporaryFailedList, readTemporaryFailedList } from "@/features/lists/temp-list-storage";
import type { TemporaryFailedListPayload } from "@/features/lists/types";
import { useTranslation } from "@/i18n/useTranslation";
import {
  clearTemporaryStudy,
  clearTemporaryStudyResults,
  saveTemporaryStudy,
  TEMP_FAILED_STUDY_QUERY_VALUE,
} from "@/lib/study/temp-study-storage";

export function TemporaryFailedListDetails() {
  const { t } = useTranslation();
  const router = useRouter();
  const [payload, setPayload] = useState<TemporaryFailedListPayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveErrorKey, setSaveErrorKey] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  useEffect(() => {
    setPayload(readTemporaryFailedList());
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
      <section className="space-y-4 rounded-[2rem] border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("lists.tempFailedMissingTitle")}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("lists.tempFailedMissingDescription")}
        </p>
        <Button asChild className="w-full">
          <Link href="/lists">{t("lists.tempFailedBackToLists")}</Link>
        </Button>
      </section>
    );
  }

  const itemCountLabel = payload.itemCount === 1 ? t("common.item") : t("common.items");
  const saveName = payload.title.trim() || `${payload.source.listName} ${t("lists.tempFailedDefaultSuffix")}`.trim() || t("lists.tempFailedFallbackTitle");

  function handleSave() {
    if (isSaving) {
      return;
    }

    setSaveErrorKey(null);

    startSaving(async () => {
      const actionPayload: TemporaryFailedListPayload = {
        kind: "failed-items",
        title: saveName,
        items: payload.items,
        itemCount: payload.itemCount,
        source: payload.source,
      };

      const result = await saveTemporaryFailedListAction(actionPayload);

      if (!result.success) {
        setSaveErrorKey(result.errorKey);
        return;
      }

      clearTemporaryFailedList();
      clearTemporaryStudy();
      clearTemporaryStudyResults();
      router.push(`/lists/${result.listId}?created=1`);
    });
  }

  function handleStudy() {
    if (isSaving) {
      return;
    }

    saveTemporaryStudy({
      kind: "temp-failed",
      title: payload.title,
      items: payload.items.map((item) => ({
        id: item.id,
        front: item.front,
        back: item.back,
        position: item.position,
      })),
      source: {
        listId: payload.source.listId,
        listName: payload.source.listName,
      },
    });
    router.push(`/study/setup?source=${encodeURIComponent(TEMP_FAILED_STUDY_QUERY_VALUE)}`);
  }

  return (
    <ListDetailsView
      eyebrow={t("lists.detailsEyebrow")}
      title={payload.title}
      description={
        <div className="space-y-1">
          <p>
            {payload.itemCount} {itemCountLabel} {t("lists.readyForFutureStudy")}
          </p>
          <p>
            {t("lists.tempFailedSourceLabel")}: {payload.source.listName}
          </p>
          <p>{t("lists.tempFailedDescription")}</p>
          {saveErrorKey ? <p className="text-red-600">{t(saveErrorKey)}</p> : null}
        </div>
      }
      items={payload.items}
      headerMeta={
        <span className="inline-flex rounded-full border border-border bg-background/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t("lists.tempFailedBadge")}
        </span>
      }
      actions={
        <>
          <Button type="button" className="w-full" onClick={handleSave} disabled={isSaving}>
            {isSaving ? t("lists.tempFailedSavePending") : t("common.save")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleStudy}
            disabled={isSaving}
          >
            {t("lists.tempFailedStudyAction")}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => router.push("/lists")} disabled={isSaving}>
            {t("lists.tempFailedBackToLists")}
          </Button>
        </>
      }
    />
  );
}
