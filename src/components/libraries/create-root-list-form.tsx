"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { LibraryListFormState } from "@/app/actions/libraries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/i18n/useTranslation";

type CreateRootListFormProps = {
  action: (state: LibraryListFormState, formData: FormData) => Promise<LibraryListFormState>;
};

const initialState: LibraryListFormState = {};

function SubmitButton() {
  const { t } = useTranslation();
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? t("libraries.createListPending") : t("libraries.createList")}
    </Button>
  );
}

export function CreateRootListForm({ action }: CreateRootListFormProps) {
  const { t } = useTranslation();
  const [state, formAction] = useActionState(action, initialState);
  const values = state.values ?? { title: "", description: "", content: "" };
  const formKey = `${values.title}:${values.description}:${values.content}`;

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {t("libraries.createList")}
        </h2>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          {t("libraries.createListDescription")}
        </p>
      </div>

      <form key={formKey} action={formAction} className="mt-5 space-y-5">
        <div className="space-y-2.5">
          <Label htmlFor="library-list-title">{t("libraries.listTitleLabel")}</Label>
          <Input
            id="library-list-title"
            name="title"
            required
            defaultValue={values.title}
            placeholder={t("libraries.listTitlePlaceholder")}
          />
          {state.fieldErrors?.title || state.fieldErrorKeys?.title ? (
            <p className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.fieldErrors?.title ?? t(state.fieldErrorKeys!.title!)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="library-list-description">{t("libraries.listDescriptionLabel")}</Label>
          <Textarea
            id="library-list-description"
            name="description"
            rows={3}
            defaultValue={values.description}
            placeholder={t("libraries.listDescriptionPlaceholder")}
            className="min-h-24"
          />
        </div>

        <div className="space-y-2.5">
          <div className="space-y-1.5">
            <Label htmlFor="library-list-content">{t("libraries.listContentLabel")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("lists.exampleLabel")}
              <span className="ml-2 font-medium text-foreground">hola % hello</span>
            </p>
          </div>
          <Textarea
            id="library-list-content"
            name="content"
            required
            defaultValue={values.content}
            placeholder={"hola % hello\nadios % goodbye"}
          />
          <p className="text-sm text-muted-foreground">{t("libraries.listContentHelp")}</p>
          {state.fieldErrors?.content || state.fieldErrorKeys?.content ? (
            <p className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.fieldErrors?.content ?? t(state.fieldErrorKeys!.content!)}
            </p>
          ) : null}
        </div>

        {typeof state.ignoredLineCount === "number" && state.ignoredLineCount > 0 ? (
          <p className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700">
            {state.ignoredLineCount}{" "}
            {state.ignoredLineCount === 1 ? t("common.line") : t("common.lines")}{" "}
            {t("lists.ignoredLinesSuffix")}
          </p>
        ) : null}

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
