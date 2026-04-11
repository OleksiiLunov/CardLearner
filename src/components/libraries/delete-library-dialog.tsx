"use client";

import { useFormStatus } from "react-dom";

import { deleteLibraryAction } from "@/app/actions/libraries";
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

function ConfirmDeleteButton() {
  const { t } = useTranslation();
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="destructive" className="w-full sm:w-auto" disabled={pending}>
      {pending ? t("libraries.deletePending") : t("libraries.deleteLibrary")}
    </Button>
  );
}

type DeleteLibraryDialogProps = {
  libraryId: string;
  libraryTitle: string;
};

export function DeleteLibraryDialog({
  libraryId,
  libraryTitle,
}: DeleteLibraryDialogProps) {
  const { t } = useTranslation();
  const deleteAction = deleteLibraryAction.bind(null, libraryId);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="destructive">
          {t("libraries.deleteLibrary")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("libraries.deleteDialogTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${libraryTitle}" ${t("libraries.deleteDialogDescriptionSuffix")}`}
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
