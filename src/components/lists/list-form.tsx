"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { ListFormState } from "@/app/actions/lists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/i18n/useTranslation";

type ListFormProps = {
  mode: "create" | "edit";
  action: (state: ListFormState, formData: FormData) => Promise<ListFormState>;
  initialValues?: {
    name: string;
    rawItems: string;
  };
};

const initialState: ListFormState = {};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { t } = useTranslation();
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending
        ? mode === "create"
          ? t("lists.createPending")
          : t("lists.savePending")
        : mode === "create"
          ? t("lists.createList")
          : t("lists.saveChanges")}
    </Button>
  );
}

export function ListForm({ mode, action, initialValues }: ListFormProps) {
  const { t } = useTranslation();
  const [state, formAction] = useActionState(action, initialState);
  const values = state.values ?? initialValues ?? { name: "", rawItems: "" };
  const formKey = `${mode}:${values.name}:${values.rawItems}`;

  return (
    <section className="space-y-7 rounded-[2.25rem] border border-border bg-card/85 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {mode === "create" ? t("lists.createEyebrow") : t("lists.editEyebrow")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          {mode === "create" ? t("lists.createHeading") : t("lists.editHeading")}
        </h1>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          {t("lists.formatDescriptionPrefix")}{" "}
          <span className="font-semibold text-foreground">front % back</span>.
        </p>
      </div>

      <form key={formKey} action={formAction} className="space-y-6">
        <div className="space-y-2.5">
          <Label htmlFor="name">{t("lists.listName")}</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder={t("lists.namePlaceholder")}
            defaultValue={values.name}
          />
          {state.fieldErrors?.name || state.fieldErrorKeys?.name ? (
            <p className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.fieldErrors?.name ?? t(state.fieldErrorKeys!.name!)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2.5">
          <div className="space-y-1.5">
            <Label htmlFor="rawItems">{t("lists.items")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("lists.exampleLabel")}
              <span className="ml-2 font-medium text-foreground">hola % hello</span>
            </p>
          </div>
          <Textarea
            id="rawItems"
            name="rawItems"
            required
            defaultValue={values.rawItems}
            placeholder={"hola % hello\nadios % goodbye"}
          />
          <p className="text-sm text-muted-foreground">{t("lists.itemsHelp")}</p>
          {state.fieldErrors?.rawItems || state.fieldErrorKeys?.rawItems ? (
            <p className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.fieldErrors?.rawItems ?? t(state.fieldErrorKeys!.rawItems!)}
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

        <SubmitButton mode={mode} />
      </form>
    </section>
  );
}
