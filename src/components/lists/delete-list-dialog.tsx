"use client";

import { useFormStatus } from "react-dom";

import { deleteListAction } from "@/app/actions/lists";
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
      {pending ? t("lists.deletePending") : t("lists.deleteList")}
    </Button>
  );
}

export function DeleteListDialog({ listId, listName }: { listId: string; listName: string }) {
  const { t } = useTranslation();
  const deleteAction = deleteListAction.bind(null, listId);

  return (
      <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto">
          {t("common.delete")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("lists.deleteDialogTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {`"${listName}" ${t("lists.deleteDialogDescriptionSuffix")}`}
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
