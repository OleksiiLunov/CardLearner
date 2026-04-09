"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import {
  createListWithItems,
  deleteListForUser,
  getListByIdForUser,
  updateListWithItems,
} from "@/lib/data/lists";
import type { TemporaryFailedListPayload } from "@/features/lists/types";
import { parseListItemsFromMultilineInput } from "@/lib/lists/parse-list-items";
import { getCurrentUser } from "@/lib/supabase/session";

export type ListFormState = {
  formError?: string;
  formErrorKey?: string;
  fieldErrors?: {
    name?: string;
    rawItems?: string;
  };
  fieldErrorKeys?: {
    name?: string;
    rawItems?: string;
  };
  values?: {
    name: string;
    rawItems: string;
  };
  ignoredLineCount?: number;
};

export type SaveTemporaryFailedListResult =
  | {
      success: true;
      listId: string;
    }
  | {
      success: false;
      errorKey: string;
    };

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isTemporaryFailedListPayload(value: unknown): value is TemporaryFailedListPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    value.kind === "failed-items" &&
    "title" in value &&
    typeof value.title === "string" &&
    "items" in value &&
    Array.isArray(value.items) &&
    value.items.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.front === "string" &&
        typeof item.back === "string" &&
        typeof item.position === "number",
    ) &&
    "source" in value &&
    typeof value.source === "object" &&
    value.source !== null &&
    typeof value.source.listId === "string" &&
    typeof value.source.listName === "string"
  );
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
  fieldErrorKeys?: ListFormState["fieldErrorKeys"];
  fieldErrors?: ListFormState["fieldErrors"];
} {
  const name = getField(formData, "name");
  const rawItems = String(formData.get("rawItems") ?? "");
  const parsed = parseListItemsFromMultilineInput(rawItems);
  const fieldErrorKeys: NonNullable<ListFormState["fieldErrorKeys"]> = {};

  if (!name) {
    fieldErrorKeys.name = "lists.nameRequired";
  }

  if (parsed.items.length === 0) {
    fieldErrorKeys.rawItems = "lists.itemsRequired";
  }

  return {
    name,
    rawItems,
    items: parsed.items,
    ignoredLineCount: parsed.ignoredLineCount,
    fieldErrorKeys: Object.keys(fieldErrorKeys).length > 0 ? fieldErrorKeys : undefined,
  };
}

function buildErrorState(
  input: ReturnType<typeof validateListInput>,
  formError?: string,
  formErrorKey?: string,
): ListFormState {
  return {
    formError,
    formErrorKey,
    fieldErrorKeys: input.fieldErrorKeys,
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

  if (input.fieldErrorKeys) {
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
    return buildErrorState(input, undefined, "lists.createError");
  }

  revalidatePath("/lists");
  redirect(`/lists/${list.id}?created=1`);
}

export async function saveTemporaryFailedListAction(
  payload: TemporaryFailedListPayload,
): Promise<SaveTemporaryFailedListResult> {
  const user = await requireAuthenticatedUser();

  if (!isTemporaryFailedListPayload(payload) || payload.items.length === 0) {
    return {
      success: false,
      errorKey: "lists.tempFailedSaveError",
    };
  }

  const name = payload.title.trim();

  if (!name) {
    return {
      success: false,
      errorKey: "lists.tempFailedSaveError",
    };
  }

  try {
    const list = await createListWithItems({
      userId: user.id,
      name,
      items: payload.items.map((item, index) => ({
        front: item.front,
        back: item.back,
        position: item.position ?? index,
      })),
    });

    revalidatePath("/lists");

    return {
      success: true,
      listId: list.id,
    };
  } catch {
    return {
      success: false,
      errorKey: "lists.tempFailedSaveError",
    };
  }
}

export async function updateListAction(
  listId: string,
  _previousState: ListFormState,
  formData: FormData,
): Promise<ListFormState> {
  const user = await requireAuthenticatedUser();
  const input = validateListInput(formData);

  if (input.fieldErrorKeys) {
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
    return buildErrorState(input, undefined, "lists.updateError");
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
