"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { saveTemporaryFailedListAction } from "@/app/actions/lists";
import { ListDetailsView } from "@/components/lists/list-details-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const studyButtonRef = useRef<HTMLButtonElement | null>(null);
  const [payload, setPayload] = useState<TemporaryFailedListPayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveErrorKey, setSaveErrorKey] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [hasInitializedTitle, setHasInitializedTitle] = useState(false);
  const [isSaving, startSaving] = useTransition();

  useEffect(() => {
    setPayload(readTemporaryFailedList());
    setLoaded(true);
  }, []);

  const currentPayload = payload;
  const itemCountLabel =
    currentPayload?.itemCount === 1 ? t("common.item") : t("common.items");
  const trimmedTitle = currentPayload?.title.trim() ?? "";
  const trimmedSourceListName = currentPayload?.source.listName.trim() ?? "";
  const derivedTitle = trimmedSourceListName
    ? `${trimmedSourceListName} ${t("lists.tempFailedDefaultSuffix")}`.trim()
    : "";
  const saveName =
    trimmedTitle || derivedTitle || t("lists.tempFailedFallbackTitle");
  const trimmedInputTitle = title.trim();
  const resolvedTitle = trimmedInputTitle || saveName;
  const translatedSaveError = saveErrorKey ? t(saveErrorKey) : null;
  const resolvedSaveError =
    translatedSaveError && translatedSaveError !== saveErrorKey
      ? translatedSaveError
      : saveErrorKey
        ? t("lists.tempFailedSaveError")
        : null;

  useEffect(() => {
    if (hasInitializedTitle || !loaded || !currentPayload) {
      return;
    }

    setTitle(saveName);
    setHasInitializedTitle(true);
  }, [currentPayload, hasInitializedTitle, loaded, saveName]);

  useEffect(() => {
    if (!loaded || !currentPayload || !hasInitializedTitle) {
      return;
    }

    const studyButton = studyButtonRef.current;

    if (!studyButton) {
      return;
    }

    studyButton.focus();
  }, [currentPayload, hasInitializedTitle, loaded]);

  if (!loaded) {
    return (
      <section className="rounded-[2rem] border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </section>
    );
  }

  if (!currentPayload) {
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

  const resolvedPayload = currentPayload;

  function handleSave() {
    if (isSaving || trimmedInputTitle.length === 0) {
      return;
    }

    setSaveErrorKey(null);

    startSaving(async () => {
      const actionPayload: TemporaryFailedListPayload = {
        kind: "failed-items",
        title: trimmedInputTitle || saveName,
        items: resolvedPayload.items,
        itemCount: resolvedPayload.itemCount,
        source: resolvedPayload.source,
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

    const storageStartedAt = performance.now();
    saveTemporaryStudy({
      kind: "temp-failed",
      title: resolvedPayload.title,
      items: resolvedPayload.items.map((item) => ({
        id: item.id,
        front: item.front,
        back: item.back,
        position: item.position,
      })),
      source: {
        listId: resolvedPayload.source.listId,
        listName: resolvedPayload.source.listName,
        sourceId: TEMP_FAILED_STUDY_QUERY_VALUE,
        queryValue: TEMP_FAILED_STUDY_QUERY_VALUE,
        backHref: "/lists/temp/failed",
      },
    });
    console.log(`[perf] study:sessionStorage ${Math.round(performance.now() - storageStartedAt)}ms`);

    const navigationStartedAt = performance.now();
    router.push(`/study/setup?source=${encodeURIComponent(TEMP_FAILED_STUDY_QUERY_VALUE)}`);
    console.log(
      `[perf] study:navigation /study/setup?source=${encodeURIComponent(TEMP_FAILED_STUDY_QUERY_VALUE)} ${Math.round(performance.now() - navigationStartedAt)}ms`,
    );
  }

  return (
    <ListDetailsView
      eyebrow={t("lists.detailsEyebrow")}
      title={resolvedTitle}
      description={
        <div className="space-y-3">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => setTitle((currentTitle) => currentTitle.trim())}
            placeholder={t("lists.tempFailedTitlePlaceholder")}
            aria-label={t("lists.listName")}
            disabled={isSaving}
          />
          <p>
            {resolvedPayload.itemCount} {itemCountLabel} {t("lists.readyForFutureStudy")}
          </p>
          <p>
            {t("lists.tempFailedSourceLabel")}: {resolvedPayload.source.listName}
          </p>
          <p>{t("lists.tempFailedDescription")}</p>
          {resolvedSaveError ? <p className="text-red-600">{resolvedSaveError}</p> : null}
        </div>
      }
      items={resolvedPayload.items}
      headerMeta={
        <span className="inline-flex rounded-full border border-border bg-background/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t("lists.tempFailedBadge")}
        </span>
      }
      actions={
        <>
          <Button
            type="button"
            className="w-full"
            onClick={handleSave}
            disabled={isSaving || trimmedInputTitle.length === 0}
          >
            {isSaving ? t("lists.tempFailedSavePending") : t("common.save")}
          </Button>
          <Button
            ref={studyButtonRef}
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
