"use client";

import { useRouter } from "next/navigation";

import type { LibraryListFormState } from "@/app/actions/libraries";
import { ListDetailsView } from "@/components/lists/list-details-view";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import {
  clearTemporaryStudy,
  clearTemporaryStudyResults,
  saveTemporaryStudy,
  TEMP_LIBRARY_STUDY_QUERY_VALUE,
  TEMP_LIBRARY_STUDY_SOURCE_ID,
} from "@/lib/study/temp-study-storage";

type LibraryListDetailsProps = {
  backHref: string;
  downloadAction: () => Promise<void>;
  libraryTitle: string;
  list: {
    id: string;
    title: string;
    description: string | null;
    items: Array<{
      id: string;
      front: string;
      back: string;
      position: number;
    }>;
  };
};

export function LibraryListDetails({
  backHref,
  downloadAction,
  libraryTitle,
  list,
}: LibraryListDetailsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const itemCount = list.items.length;

  function handleStudy() {
    clearTemporaryStudy();
    clearTemporaryStudyResults();
    saveTemporaryStudy({
      kind: "library-list",
      title: list.title,
      items: list.items.map((item) => ({
        id: item.id,
        front: item.front,
        back: item.back,
        position: item.position,
      })),
      source: {
        listId: list.id,
        listName: list.title,
        sourceId: TEMP_LIBRARY_STUDY_SOURCE_ID,
        queryValue: TEMP_LIBRARY_STUDY_QUERY_VALUE,
        backHref,
      },
    });
    router.push(`/study/setup?source=${encodeURIComponent(TEMP_LIBRARY_STUDY_QUERY_VALUE)}`);
  }

  return (
    <ListDetailsView
      eyebrow={t("libraries.listDetailsEyebrow")}
      title={list.title}
      description={
        <div className="space-y-2">
          <p>
            {itemCount} {itemCount === 1 ? t("common.item") : t("common.items")}{" "}
            {t("lists.readyForFutureStudy")}
          </p>
          <p>{libraryTitle}</p>
          {list.description ? <p>{list.description}</p> : null}
        </div>
      }
      items={list.items}
      actions={
        <>
          <form action={downloadAction} className="w-full">
            <Button type="submit" className="w-full">
              {t("libraries.downloadList")}
            </Button>
          </form>
          <Button type="button" variant="secondary" className="w-full" onClick={handleStudy}>
            {t("navigation.study")}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => router.push(backHref)}>
            {t("common.back")}
          </Button>
        </>
      }
    />
  );
}
