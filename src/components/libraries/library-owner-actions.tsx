"use client";

import type { ReactNode } from "react";

import type {
  LibraryFormState,
  LibraryFolderFormState,
  LibraryListFormState,
} from "@/app/actions/libraries";
import { CreateRootFolderForm } from "@/components/libraries/create-root-folder-form";
import { CreateRootListForm } from "@/components/libraries/create-root-list-form";
import { EditLibraryForm } from "@/components/libraries/edit-library-form";
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

type LibraryOwnerActionsProps = {
  editLibraryAction: (
    state: LibraryFormState,
    formData: FormData,
  ) => Promise<LibraryFormState>;
  initialLibraryValues: {
    title: string;
    description: string;
  };
  createFolderAction: (
    state: LibraryFolderFormState,
    formData: FormData,
  ) => Promise<LibraryFolderFormState>;
  createListAction: (
    state: LibraryListFormState,
    formData: FormData,
  ) => Promise<LibraryListFormState>;
};

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
        <Button type="button" size="sm" variant="secondary">
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

export function LibraryOwnerActions({
  editLibraryAction,
  initialLibraryValues,
  createFolderAction,
  createListAction,
}: LibraryOwnerActionsProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-wrap gap-2">
        <OwnerActionDialog
          description={t("libraries.editDescription")}
          title={t("libraries.editLibrary")}
          triggerLabel={t("common.edit")}
        >
          <EditLibraryForm action={editLibraryAction} initialValues={initialLibraryValues} />
        </OwnerActionDialog>
        <OwnerActionDialog
          description={t("libraries.createFolderDescription")}
          title={t("libraries.createFolder")}
          triggerLabel={t("libraries.createFolder")}
        >
          <CreateRootFolderForm action={createFolderAction} />
        </OwnerActionDialog>
        <OwnerActionDialog
          description={t("libraries.createListDescription")}
          title={t("libraries.createList")}
          triggerLabel={t("libraries.createList")}
        >
          <CreateRootListForm action={createListAction} />
        </OwnerActionDialog>
      </div>
    </section>
  );
}
