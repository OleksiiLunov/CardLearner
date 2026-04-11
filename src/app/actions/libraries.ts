"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { createLibrary, createRootLibraryFolder, getLibraryById } from "@/lib/data/libraries";
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

export type LibraryFolderFormState = {
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

function validateLibraryFolderInput(formData: FormData): {
  title: string;
  fieldErrorKeys?: LibraryFolderFormState["fieldErrorKeys"];
} {
  const title = getField(formData, "title");
  const fieldErrorKeys: NonNullable<LibraryFolderFormState["fieldErrorKeys"]> = {};

  if (!title) {
    fieldErrorKeys.title = "libraries.folderTitleRequired";
  }

  return {
    title,
    fieldErrorKeys: Object.keys(fieldErrorKeys).length > 0 ? fieldErrorKeys : undefined,
  };
}

function buildFolderErrorState(
  input: ReturnType<typeof validateLibraryFolderInput>,
  formError?: string,
  formErrorKey?: string,
): LibraryFolderFormState {
  return {
    formError,
    formErrorKey,
    fieldErrorKeys: input.fieldErrorKeys,
    values: {
      title: input.title,
    },
  };
}

export async function createRootLibraryFolderAction(
  libraryId: string,
  _previousState: LibraryFolderFormState,
  formData: FormData,
): Promise<LibraryFolderFormState> {
  const user = await requireAuthenticatedUser();
  const library = await getLibraryById(libraryId);

  if (!library || library.ownerId !== user.id) {
    notFound();
  }

  const currentLibrary = library;
  const input = validateLibraryFolderInput(formData);

  if (input.fieldErrorKeys) {
    return buildFolderErrorState(input);
  }

  try {
    await createRootLibraryFolder({
      libraryId: currentLibrary.id,
      ownerId: user.id,
      title: input.title,
    });
  } catch {
    return buildFolderErrorState(input, undefined, "libraries.createFolderError");
  }

  revalidatePath("/libraries");
  revalidatePath(`/libraries/${currentLibrary.id}`);
  redirect(`/libraries/${currentLibrary.id}`);
}
