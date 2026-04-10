import type { TemporaryFailedListPayload, TemporaryListItem } from "@/features/lists/types";

const TEMP_FAILED_LIST_STORAGE_KEY = "lists:temp:failed";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function isTemporaryListItem(value: unknown): value is TemporaryListItem {
  const item = asRecord(value);

  if (!item) {
    return false;
  }

  return (
    typeof item.id === "string" &&
    typeof item.front === "string" &&
    typeof item.back === "string" &&
    typeof item.position === "number"
  );
}

function isTemporaryFailedListPayload(value: unknown): value is TemporaryFailedListPayload {
  const payload = asRecord(value);

  if (!payload) {
    return false;
  }

  const source = asRecord(payload.source);

  return (
    payload.kind === "failed-items" &&
    typeof payload.title === "string" &&
    Array.isArray(payload.items) &&
    payload.items.every(isTemporaryListItem) &&
    typeof payload.itemCount === "number" &&
    payload.itemCount === payload.items.length &&
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
