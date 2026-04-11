"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import {
  createLibrary,
  createNestedLibraryFolder,
  createNestedLibraryList,
  createPrivateListFromLibraryList,
  createRootLibraryFolder,
  createRootLibraryList,
  getLibraryById,
  getLibraryFolderById,
  getLibraryListById,
} from "@/lib/data/libraries";
import { parseListItemsFromMultilineInput } from "@/lib/lists/parse-list-items";
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

export type LibraryListFormState = {
  formError?: string;
  formErrorKey?: string;
  fieldErrors?: {
    title?: string;
    content?: string;
  };
  fieldErrorKeys?: {
    title?: string;
    content?: string;
  };
  values?: {
    title: string;
    description: string;
    content: string;
  };
  ignoredLineCount?: number;
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

export async function createNestedLibraryFolderAction(
  libraryId: string,
  parentFolderId: string,
  _previousState: LibraryFolderFormState,
  formData: FormData,
): Promise<LibraryFolderFormState> {
  const user = await requireAuthenticatedUser();
  const [library, parentFolder] = await Promise.all([
    getLibraryById(libraryId),
    getLibraryFolderById(libraryId, parentFolderId),
  ]);

  if (!library || library.ownerId !== user.id || !parentFolder) {
    notFound();
  }

  const currentLibrary = library;
  const currentParentFolder = parentFolder;
  const input = validateLibraryFolderInput(formData);

  if (input.fieldErrorKeys) {
    return buildFolderErrorState(input);
  }

  try {
    await createNestedLibraryFolder({
      libraryId: currentLibrary.id,
      parentFolderId: currentParentFolder.id,
      ownerId: user.id,
      title: input.title,
    });
  } catch {
    return buildFolderErrorState(input, undefined, "libraries.createNestedFolderError");
  }

  revalidatePath("/libraries");
  revalidatePath(`/libraries/${currentLibrary.id}`);
  revalidatePath(`/libraries/${currentLibrary.id}/folders/${currentParentFolder.id}`);
  redirect(`/libraries/${currentLibrary.id}/folders/${currentParentFolder.id}`);
}

function validateLibraryListInput(formData: FormData): {
  title: string;
  description: string | null;
  rawDescription: string;
  content: string;
  ignoredLineCount: number;
  items: ReturnType<typeof parseListItemsFromMultilineInput>["items"];
  fieldErrorKeys?: LibraryListFormState["fieldErrorKeys"];
} {
  const title = getField(formData, "title");
  const rawDescription = getField(formData, "description");
  const content = String(formData.get("content") ?? "");
  const parsed = parseListItemsFromMultilineInput(content);
  const fieldErrorKeys: NonNullable<LibraryListFormState["fieldErrorKeys"]> = {};

  if (!title) {
    fieldErrorKeys.title = "libraries.listTitleRequired";
  }

  if (parsed.items.length === 0) {
    fieldErrorKeys.content = "libraries.listContentRequired";
  }

  return {
    title,
    description: rawDescription ? rawDescription : null,
    rawDescription,
    content,
    ignoredLineCount: parsed.ignoredLineCount,
    items: parsed.items,
    fieldErrorKeys: Object.keys(fieldErrorKeys).length > 0 ? fieldErrorKeys : undefined,
  };
}

function buildListErrorState(
  input: ReturnType<typeof validateLibraryListInput>,
  formError?: string,
  formErrorKey?: string,
): LibraryListFormState {
  return {
    formError,
    formErrorKey,
    fieldErrorKeys: input.fieldErrorKeys,
    ignoredLineCount: input.ignoredLineCount,
    values: {
      title: input.title,
      description: input.rawDescription,
      content: input.content,
    },
  };
}

export async function createRootLibraryListAction(
  libraryId: string,
  _previousState: LibraryListFormState,
  formData: FormData,
): Promise<LibraryListFormState> {
  const user = await requireAuthenticatedUser();
  const library = await getLibraryById(libraryId);

  if (!library || library.ownerId !== user.id) {
    notFound();
  }

  const currentLibrary = library;
  const input = validateLibraryListInput(formData);

  if (input.fieldErrorKeys) {
    return buildListErrorState(input);
  }

  try {
    await createRootLibraryList({
      libraryId: currentLibrary.id,
      ownerId: user.id,
      title: input.title,
      description: input.description,
      items: input.items,
    });
  } catch {
    return buildListErrorState(input, undefined, "libraries.createListError");
  }

  revalidatePath("/libraries");
  revalidatePath(`/libraries/${currentLibrary.id}`);
  redirect(`/libraries/${currentLibrary.id}`);
}

export async function createNestedLibraryListAction(
  libraryId: string,
  parentFolderId: string,
  _previousState: LibraryListFormState,
  formData: FormData,
): Promise<LibraryListFormState> {
  const user = await requireAuthenticatedUser();
  const [library, parentFolder] = await Promise.all([
    getLibraryById(libraryId),
    getLibraryFolderById(libraryId, parentFolderId),
  ]);

  if (!library || library.ownerId !== user.id || !parentFolder) {
    notFound();
  }

  const currentLibrary = library;
  const currentParentFolder = parentFolder;
  const input = validateLibraryListInput(formData);

  if (input.fieldErrorKeys) {
    return buildListErrorState(input);
  }

  try {
    await createNestedLibraryList({
      libraryId: currentLibrary.id,
      parentFolderId: currentParentFolder.id,
      ownerId: user.id,
      title: input.title,
      description: input.description,
      items: input.items,
    });
  } catch {
    return buildListErrorState(input, undefined, "libraries.createNestedListError");
  }

  revalidatePath("/libraries");
  revalidatePath(`/libraries/${currentLibrary.id}`);
  revalidatePath(`/libraries/${currentLibrary.id}/folders/${currentParentFolder.id}`);
  redirect(`/libraries/${currentLibrary.id}/folders/${currentParentFolder.id}`);
}

export async function downloadLibraryListAction(libraryId: string, listId: string) {
  const user = await requireAuthenticatedUser();
  const [library, libraryList] = await Promise.all([
    getLibraryById(libraryId),
    getLibraryListById(libraryId, listId),
  ]);

  if (!library || !libraryList) {
    notFound();
  }

  const currentLibraryList = libraryList;

  await createPrivateListFromLibraryList(library.id, currentLibraryList.id, user.id);

  revalidatePath("/lists");
  redirect("/lists");
}
