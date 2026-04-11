"use client";

import { useFormStatus } from "react-dom";

import { deleteLibraryFolderAction } from "@/app/actions/libraries";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";

type DeleteLibraryFolderDialogProps = {
  folderId: string;
  folderTitle: string;
  libraryId: string;
};

function ConfirmDeleteButton() {
  const { t } = useTranslation();
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="destructive" className="w-full sm:w-auto" disabled={pending}>
      {pending ? t("libraries.deleteFolderPending") : t("libraries.deleteFolder")}
    </Button>
  );
}

export function DeleteLibraryFolderDialog({
  folderId,
  folderTitle,
  libraryId,
}: DeleteLibraryFolderDialogProps) {
  const { t } = useTranslation();
  const deleteAction = deleteLibraryFolderAction.bind(null, libraryId, folderId);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="destructive">
          {t("libraries.deleteFolder")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("libraries.deleteFolderDialogTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${folderTitle}" ${t("libraries.deleteFolderDialogDescriptionSuffix")}`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <form action={deleteAction}>
            <ConfirmDeleteButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
