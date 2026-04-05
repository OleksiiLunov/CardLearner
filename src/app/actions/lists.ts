"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import {
  createListWithItems,
  deleteListForUser,
  getListByIdForUser,
  updateListWithItems,
} from "@/lib/data/lists";
import { parseListItemsFromMultilineInput } from "@/lib/lists/parse-list-items";
import { getCurrentUser } from "@/lib/supabase/session";

export type ListFormState = {
  formError?: string;
  fieldErrors?: {
    name?: string;
    rawItems?: string;
  };
  values?: {
    name: string;
    rawItems: string;
  };
  ignoredLineCount?: number;
};

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

function validateListInput(formData: FormData): {
  name: string;
  rawItems: string;
  ignoredLineCount: number;
  items: ReturnType<typeof parseListItemsFromMultilineInput>["items"];
  fieldErrors?: ListFormState["fieldErrors"];
} {
  const name = getField(formData, "name");
  const rawItems = String(formData.get("rawItems") ?? "");
  const parsed = parseListItemsFromMultilineInput(rawItems);
  const fieldErrors: NonNullable<ListFormState["fieldErrors"]> = {};

  if (!name) {
    fieldErrors.name = "List name is required.";
  }

  if (parsed.items.length === 0) {
    fieldErrors.rawItems = "Add at least one valid item using the format front % back.";
  }

  return {
    name,
    rawItems,
    items: parsed.items,
    ignoredLineCount: parsed.ignoredLineCount,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  };
}

function buildErrorState(
  input: ReturnType<typeof validateListInput>,
  formError?: string,
): ListFormState {
  return {
    formError,
    fieldErrors: input.fieldErrors,
    ignoredLineCount: input.ignoredLineCount,
    values: {
      name: input.name,
      rawItems: input.rawItems,
    },
  };
}

export async function createListAction(
  _previousState: ListFormState,
  formData: FormData,
): Promise<ListFormState> {
  const user = await requireAuthenticatedUser();
  const input = validateListInput(formData);

  if (input.fieldErrors) {
    return buildErrorState(input);
  }

  let list;

  try {
    list = await createListWithItems({
      userId: user.id,
      name: input.name,
      items: input.items,
    });
  } catch {
    return buildErrorState(input, "Unable to create the list right now. Please try again.");
  }

  revalidatePath("/lists");
  redirect(`/lists/${list.id}?created=1`);
}

export async function updateListAction(
  listId: string,
  _previousState: ListFormState,
  formData: FormData,
): Promise<ListFormState> {
  const user = await requireAuthenticatedUser();
  const input = validateListInput(formData);

  if (input.fieldErrors) {
    return buildErrorState(input);
  }

  let updatedList;

  try {
    updatedList = await updateListWithItems({
      listId,
      userId: user.id,
      name: input.name,
      items: input.items,
    });
  } catch {
    return buildErrorState(input, "Unable to save changes right now. Please try again.");
  }

  if (!updatedList) {
    notFound();
  }

  revalidatePath("/lists");
  revalidatePath(`/lists/${listId}`);
  revalidatePath(`/lists/${listId}/edit`);
  redirect(`/lists/${listId}?updated=1`);
}

export async function deleteListAction(listId: string) {
  const user = await requireAuthenticatedUser();
  const existingList = await getListByIdForUser(listId, user.id);

  if (!existingList) {
    notFound();
  }

  await deleteListForUser(listId, user.id);

  revalidatePath("/lists");
  redirect("/lists?deleted=1");
}
