"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { ListFormState } from "@/app/actions/lists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (mode === "create" ? "Creating list..." : "Saving changes...") : mode === "create" ? "Create list" : "Save changes"}
    </Button>
  );
}

export function ListForm({ mode, action, initialValues }: ListFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const values = state.values ?? initialValues ?? { name: "", rawItems: "" };
  const formKey = `${mode}:${values.name}:${values.rawItems}`;

  return (
    <section className="space-y-7 rounded-[2.25rem] border border-border bg-card/85 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {mode === "create" ? "Create List" : "Edit List"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          {mode === "create" ? "Create a new list." : "Edit your list."}
        </h1>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          Add one card per line using the format <span className="font-semibold text-foreground">front % back</span>.
        </p>
      </div>

      <form key={formKey} action={formAction} className="space-y-6">
        <div className="space-y-2.5">
          <Label htmlFor="name">List name</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Spanish basics"
            defaultValue={values.name}
          />
          {state.fieldErrors?.name ? (
            <p className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2.5">
          <div className="space-y-1.5">
            <Label htmlFor="rawItems">Items</Label>
            <p className="text-sm text-muted-foreground">
              Example:
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
          <p className="text-sm text-muted-foreground">
            Empty lines and invalid rows are ignored. Valid rows keep the entered order.
          </p>
          {state.fieldErrors?.rawItems ? (
            <p className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.fieldErrors.rawItems}
            </p>
          ) : null}
        </div>

        {typeof state.ignoredLineCount === "number" && state.ignoredLineCount > 0 ? (
          <p className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700">
            {state.ignoredLineCount} line{state.ignoredLineCount === 1 ? "" : "s"} will be ignored because they are empty or not in the expected format.
          </p>
        ) : null}

        {state.formError ? (
          <p className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {state.formError}
          </p>
        ) : null}

        <SubmitButton mode={mode} />
      </form>
    </section>
  );
}
