"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import type { LibraryListFormState } from "@/app/actions/libraries";
import { DeleteLibraryListDialog } from "@/components/libraries/delete-library-list-dialog";
import { EditLibraryListForm } from "@/components/libraries/edit-library-list-form";
import { ListDetailsView } from "@/components/lists/list-details-view";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import {
  clearTemporaryStudy,
  clearTemporaryStudyResults,
  saveTemporaryStudy,
  TEMP_LIBRARY_STUDY_QUERY_VALUE,
  TEMP_LIBRARY_STUDY_SOURCE_ID,
} from "@/lib/study/temp-study-storage";

type OwnerActionDialogProps = {
  children: ReactNode;
  description: string;
  title: string;
  triggerLabel: string;
};

function OwnerActionDialog({
  children,
  description,
  title,
  triggerLabel,
}: OwnerActionDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="secondary" className="w-full">
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[calc(100vh-1.5rem)] max-w-3xl overflow-y-auto border-0 bg-transparent p-0 shadow-none">
        <AlertDialogHeader className="sr-only">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3">
          <div className="flex justify-end px-1">
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          </div>
          {children}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type LibraryListDetailsProps = {
  backHref: string;
  canEdit: boolean;
  deleteActionTarget?: {
    libraryId: string;
    listId: string;
  };
  downloadAction: () => Promise<void>;
  editAction?: (state: LibraryListFormState, formData: FormData) => Promise<LibraryListFormState>;
  libraryTitle: string;
  initialEditValues?: {
    title: string;
    description: string;
    content: string;
  };
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
  canEdit,
  deleteActionTarget,
  downloadAction,
  editAction,
  initialEditValues,
  libraryTitle,
  list,
}: LibraryListDetailsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const itemCount = list.items.length;

  function handleStudy() {
    const storageStartedAt = performance.now();
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
    console.log(`[perf] study:sessionStorage ${Math.round(performance.now() - storageStartedAt)}ms`);

    const navigationStartedAt = performance.now();
    router.push(`/study/setup?source=${encodeURIComponent(TEMP_LIBRARY_STUDY_QUERY_VALUE)}`);
    console.log(
      `[perf] study:navigation /study/setup?source=${encodeURIComponent(TEMP_LIBRARY_STUDY_QUERY_VALUE)} ${Math.round(performance.now() - navigationStartedAt)}ms`,
    );
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
          {canEdit && editAction && initialEditValues ? (
            <OwnerActionDialog
              description={t("libraries.editListDescription")}
              title={t("libraries.editList")}
              triggerLabel={t("common.edit")}
            >
              <EditLibraryListForm action={editAction} initialValues={initialEditValues} />
            </OwnerActionDialog>
          ) : null}
          {canEdit && deleteActionTarget ? (
            <DeleteLibraryListDialog
              libraryId={deleteActionTarget.libraryId}
              listId={deleteActionTarget.listId}
              listTitle={list.title}
            />
          ) : null}
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
