"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createLibrary } from "@/lib/data/libraries";
import { getCurrentUser } from "@/lib/supabase/session";

export type LibraryFormState = {
  formError?: string;
  formErrorKey?: string;
  fieldErrors?: {
    title?: string;
  };
  fieldErrorKeys?: {
    title?: string;
  };
  values?: {
    title: string;
    description: string;
  };
};

function getField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

function validateLibraryInput(formData: FormData): {
  title: string;
  description: string | null;
  rawDescription: string;
  fieldErrorKeys?: LibraryFormState["fieldErrorKeys"];
} {
  const title = getField(formData, "title");
  const rawDescription = getField(formData, "description");
  const fieldErrorKeys: NonNullable<LibraryFormState["fieldErrorKeys"]> = {};

  if (!title) {
    fieldErrorKeys.title = "libraries.titleRequired";
  }

  return {
    title,
    description: rawDescription ? rawDescription : null,
    rawDescription,
    fieldErrorKeys: Object.keys(fieldErrorKeys).length > 0 ? fieldErrorKeys : undefined,
  };
}

function buildErrorState(
  input: ReturnType<typeof validateLibraryInput>,
  formError?: string,
  formErrorKey?: string,
): LibraryFormState {
  return {
    formError,
    formErrorKey,
    fieldErrorKeys: input.fieldErrorKeys,
    values: {
      title: input.title,
      description: input.rawDescription,
    },
  };
}

export async function createLibraryAction(
  _previousState: LibraryFormState,
  formData: FormData,
): Promise<LibraryFormState> {
  const user = await requireAuthenticatedUser();
  const input = validateLibraryInput(formData);

  if (input.fieldErrorKeys) {
    return buildErrorState(input);
  }

  let library;

  try {
    library = await createLibrary({
      ownerId: user.id,
      title: input.title,
      description: input.description,
    });
  } catch {
    return buildErrorState(input, undefined, "libraries.createError");
  }

  revalidatePath("/libraries");
  redirect(`/libraries/${library.id}`);
}
