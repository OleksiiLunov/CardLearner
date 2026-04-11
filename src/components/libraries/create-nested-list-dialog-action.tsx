"use client";

import type { LibraryListFormState } from "@/app/actions/libraries";
import { CreateRootListForm } from "@/components/libraries/create-root-list-form";
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

type CreateNestedListDialogActionProps = {
  action: (state: LibraryListFormState, formData: FormData) => Promise<LibraryListFormState>;
};

export function CreateNestedListDialogAction({ action }: CreateNestedListDialogActionProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary">
          {t("libraries.createList")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[calc(100vh-1.5rem)] max-w-3xl overflow-y-auto border-0 bg-transparent p-0 shadow-none">
        <AlertDialogHeader className="sr-only">
          <AlertDialogTitle>{t("libraries.createList")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("libraries.createNestedListDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3">
          <div className="flex justify-end px-1">
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          </div>
          <CreateRootListForm action={action} />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
