"use client";

import type { LibraryFolderFormState } from "@/app/actions/libraries";
import { CreateNestedListDialogAction } from "@/components/libraries/create-nested-list-dialog-action";
import { CreateRootFolderForm } from "@/components/libraries/create-root-folder-form";
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

type CreateNestedFolderDialogActionProps = {
  action: (state: LibraryFolderFormState, formData: FormData) => Promise<LibraryFolderFormState>;
  createListAction?: (
    state: import("@/app/actions/libraries").LibraryListFormState,
    formData: FormData,
  ) => Promise<import("@/app/actions/libraries").LibraryListFormState>;
};

export function CreateNestedFolderDialogAction({
  action,
  createListAction,
}: CreateNestedFolderDialogActionProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-wrap gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" size="sm" variant="secondary">
              {t("libraries.createFolder")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-h-[calc(100vh-1.5rem)] max-w-3xl overflow-y-auto border-0 bg-transparent p-0 shadow-none">
            <AlertDialogHeader className="sr-only">
              <AlertDialogTitle>{t("libraries.createFolder")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("libraries.createNestedFolderDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3">
              <div className="flex justify-end px-1">
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              </div>
              <CreateRootFolderForm action={action} />
            </div>
          </AlertDialogContent>
        </AlertDialog>
        {createListAction ? <CreateNestedListDialogAction action={createListAction} /> : null}
      </div>
    </section>
  );
}
