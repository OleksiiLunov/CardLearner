"use client";

import type { LibraryFormState } from "@/app/actions/libraries";
import { CreateLibraryForm } from "@/components/libraries/create-library-form";
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

type CreateLibraryDialogActionProps = {
  action: (state: LibraryFormState, formData: FormData) => Promise<LibraryFormState>;
};

export function CreateLibraryDialogAction({ action }: CreateLibraryDialogActionProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary">
          {t("libraries.createLibrary")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[calc(100vh-1.5rem)] max-w-3xl overflow-y-auto border-0 bg-transparent p-0 shadow-none">
        <AlertDialogHeader className="sr-only">
          <AlertDialogTitle>{t("libraries.createLibrary")}</AlertDialogTitle>
          <AlertDialogDescription>{t("libraries.createDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3">
          <div className="flex justify-end px-1">
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          </div>
          <CreateLibraryForm action={action} />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
