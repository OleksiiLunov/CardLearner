"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createListWithItems } from "@/lib/data/lists";
import { getCurrentUser } from "@/lib/supabase/session";
import type { StudyCard } from "@/lib/study/types";

export type FailedListActionState = {
  error?: string;
  values?: {
    name: string;
    itemsJson: string;
  };
};

function parseFailedItems(itemsJson: string): StudyCard[] | null {
  try {
    const parsed = JSON.parse(itemsJson) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    const items = parsed.filter(
      (item): item is StudyCard =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.front === "string" &&
        typeof item.back === "string" &&
        typeof item.position === "number",
    );

    return items.length === parsed.length ? items : null;
  } catch {
    return null;
  }
}

export async function createFailedItemsListAction(
  _previousState: FailedListActionState,
  formData: FormData,
): Promise<FailedListActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const itemsJson = String(formData.get("itemsJson") ?? "");
  const failedItems = parseFailedItems(itemsJson);

  if (!name) {
    return {
      error: "New list name is required.",
      values: {
        name,
        itemsJson,
      },
    };
  }

  if (!failedItems || failedItems.length === 0) {
    return {
      error: "There are no failed items available to save.",
      values: {
        name,
        itemsJson,
      },
    };
  }

  const list = await createListWithItems({
    userId: user.id,
    name,
    items: failedItems.map((item, index) => ({
      front: item.front,
      back: item.back,
      position: index,
    })),
  });

  revalidatePath("/lists");
  redirect(`/lists/${list.id}?created=1`);
}
