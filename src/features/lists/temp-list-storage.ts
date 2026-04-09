import type { TemporaryFailedListPayload, TemporaryListItem } from "@/features/lists/types";

const TEMP_FAILED_LIST_STORAGE_KEY = "lists:temp:failed";

function isTemporaryListItem(value: unknown): value is TemporaryListItem {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.id === "string" &&
    typeof value.front === "string" &&
    typeof value.back === "string" &&
    typeof value.position === "number"
  );
}

function isTemporaryFailedListPayload(value: unknown): value is TemporaryFailedListPayload {
  const source =
    typeof value === "object" &&
    value !== null &&
    "source" in value &&
    typeof value.source === "object" &&
    value.source !== null
      ? (value.source as Record<string, unknown>)
      : null;

  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    value.kind === "failed-items" &&
    "title" in value &&
    typeof value.title === "string" &&
    "items" in value &&
    Array.isArray(value.items) &&
    value.items.every(isTemporaryListItem) &&
    "itemCount" in value &&
    typeof value.itemCount === "number" &&
    value.itemCount === value.items.length &&
    source !== null &&
    typeof source.listId === "string" &&
    typeof source.listName === "string" &&
    (source.initialSide === "front" || source.initialSide === "back") &&
    (source.order === "original" || source.order === "random")
  );
}

export function saveTemporaryFailedList(payload: TemporaryFailedListPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(TEMP_FAILED_LIST_STORAGE_KEY, JSON.stringify(payload));
}

export function readTemporaryFailedList(): TemporaryFailedListPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(TEMP_FAILED_LIST_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isTemporaryFailedListPayload(parsed)) {
      window.sessionStorage.removeItem(TEMP_FAILED_LIST_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.sessionStorage.removeItem(TEMP_FAILED_LIST_STORAGE_KEY);
    return null;
  }
}

export function clearTemporaryFailedList() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(TEMP_FAILED_LIST_STORAGE_KEY);
}

export function hasTemporaryFailedList() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(TEMP_FAILED_LIST_STORAGE_KEY) !== null;
}
