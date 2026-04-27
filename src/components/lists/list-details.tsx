"use client";

import Link from "next/link";

import { DeleteListDialog } from "@/components/lists/delete-list-dialog";
import { ListDetailsView } from "@/components/lists/list-details-view";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import { saveNormalStudySetupSourcePayload } from "@/lib/study/storage";

type ListDetailsProps = {
  created: boolean;
  updated: boolean;
  list: {
    id: string;
    name: string;
    items: Array<{
      id: string;
      front: string;
      back: string;
      position: number;
    }>;
  };
};

export function ListDetails({ created, updated, list }: ListDetailsProps) {
  const { t } = useTranslation();

  function handleStudyClick() {
    saveNormalStudySetupSourcePayload({
      kind: "saved-list-source",
      listId: list.id,
      listName: list.name,
      items: list.items.map((item) => ({
        id: item.id,
        front: item.front,
        back: item.back,
        position: item.position,
      })),
    });
  }

  return (
    <ListDetailsView
      eyebrow={t("lists.detailsEyebrow")}
      title={list.name}
      description={
        <>
          {list.items.length} {list.items.length === 1 ? t("common.item") : t("common.items")}{" "}
          {t("lists.readyForFutureStudy")}
        </>
      }
      items={list.items}
      actions={
        <>
          <Button asChild className="w-full">
            <Link href={`/study/setup?listId=${encodeURIComponent(list.id)}`} onClick={handleStudyClick}>
              {t("navigation.study")}
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href={`/lists/${list.id}/edit`}>{t("common.edit")}</Link>
          </Button>
          <DeleteListDialog listId={list.id} listName={list.name} />
        </>
      }
      notices={
        <>
          {created ? (
            <p className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {t("lists.createdSuccess")}
            </p>
          ) : null}
          {updated ? (
            <p className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {t("lists.updatedSuccess")}
            </p>
          ) : null}
        </>
      }
    />
  );
}
