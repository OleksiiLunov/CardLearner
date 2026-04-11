"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { LibraryFormState } from "@/app/actions/libraries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/i18n/useTranslation";

type CreateLibraryFormProps = {
  action: (state: LibraryFormState, formData: FormData) => Promise<LibraryFormState>;
};

const initialState: LibraryFormState = {};

function SubmitButton() {
  const { t } = useTranslation();
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? t("libraries.createPending") : t("libraries.createLibrary")}
    </Button>
  );
}

export function CreateLibraryForm({ action }: CreateLibraryFormProps) {
  const { t } = useTranslation();
  const [state, formAction] = useActionState(action, initialState);
  const values = state.values ?? { title: "", description: "" };
  const formKey = `${values.title}:${values.description}`;

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {t("libraries.createLibrary")}
        </h2>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          {t("libraries.createDescription")}
        </p>
      </div>

      <form key={formKey} action={formAction} className="mt-5 space-y-5">
        <div className="space-y-2.5">
          <Label htmlFor="title">{t("libraries.titleLabel")}</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={values.title}
            placeholder={t("libraries.titlePlaceholder")}
          />
          {state.fieldErrors?.title || state.fieldErrorKeys?.title ? (
            <p className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.fieldErrors?.title ?? t(state.fieldErrorKeys!.title!)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="description">{t("libraries.descriptionLabel")}</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={values.description}
            placeholder={t("libraries.descriptionPlaceholder")}
            className="min-h-28"
          />
        </div>

        {state.formError || state.formErrorKey ? (
          <p className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {state.formError ?? t(state.formErrorKey!)}
          </p>
        ) : null}

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </section>
  );
}
