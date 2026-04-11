"use client";

import { useFormStatus } from "react-dom";

import { deleteLibraryListAction } from "@/app/actions/libraries";
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

type DeleteLibraryListDialogProps = {
  libraryId: string;
  listId: string;
  listTitle: string;
};

function ConfirmDeleteButton() {
  const { t } = useTranslation();
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="destructive" className="w-full sm:w-auto" disabled={pending}>
      {pending ? t("libraries.deleteListPending") : t("libraries.deleteList")}
    </Button>
  );
}

export function DeleteLibraryListDialog({
  libraryId,
  listId,
  listTitle,
}: DeleteLibraryListDialogProps) {
  const { t } = useTranslation();
  const deleteAction = deleteLibraryListAction.bind(null, libraryId, listId);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" className="w-full">
          {t("libraries.deleteList")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("libraries.deleteListDialogTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${listTitle}" ${t("libraries.deleteListDialogDescriptionSuffix")}`}
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
