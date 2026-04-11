import type { StudyCard, TemporaryStudyKind, TemporaryStudyPayload } from "@/lib/study/types";

export const TEMP_FAILED_STUDY_SOURCE_ID = "temp-failed";
export const TEMP_FAILED_STUDY_QUERY_VALUE = "temp-failed";
export const TEMP_LIBRARY_STUDY_SOURCE_ID = "library-list";
export const TEMP_LIBRARY_STUDY_QUERY_VALUE = "library-list";

const TEMP_STUDY_STORAGE_KEY = "study:temp:failed";

type TemporaryStudySourceQueryValue =
  | typeof TEMP_FAILED_STUDY_QUERY_VALUE
  | typeof TEMP_LIBRARY_STUDY_QUERY_VALUE;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function isStudyCard(value: unknown): value is StudyCard {
  const card = asRecord(value);

  if (!card) {
    return false;
  }

  return (
    typeof card.id === "string" &&
    typeof card.front === "string" &&
    typeof card.back === "string" &&
    typeof card.position === "number"
  );
}

function isTemporaryStudyPayload(value: unknown): value is TemporaryStudyPayload {
  const payload = asRecord(value);

  if (!payload) {
    return false;
  }

  const source = asRecord(payload.source);

  return (
    (payload.kind === "temp-failed" || payload.kind === "library-list") &&
    typeof payload.title === "string" &&
    Array.isArray(payload.items) &&
    payload.items.every(isStudyCard) &&
    source !== null &&
    typeof source.listId === "string" &&
    typeof source.listName === "string" &&
    typeof source.sourceId === "string" &&
    typeof source.queryValue === "string" &&
    typeof source.backHref === "string"
  );
}

export function isTemporaryStudySourceQueryValue(
  value: string | null,
): value is TemporaryStudySourceQueryValue {
  return value === TEMP_FAILED_STUDY_QUERY_VALUE || value === TEMP_LIBRARY_STUDY_QUERY_VALUE;
}

export function getTemporaryStudyResultsStorageKey(sourceId: string) {
  return `study-results:${sourceId}`;
}

export function getTemporaryStudyFallbackHref(
  source: TemporaryStudySourceQueryValue | null,
): string {
  if (source === TEMP_LIBRARY_STUDY_QUERY_VALUE) {
    return "/libraries";
  }

  return "/lists/temp/failed";
}

export function saveTemporaryStudy(payload: TemporaryStudyPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(TEMP_STUDY_STORAGE_KEY, JSON.stringify(payload));
}

export function readTemporaryStudy(): TemporaryStudyPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(TEMP_STUDY_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isTemporaryStudyPayload(parsed)) {
      window.sessionStorage.removeItem(TEMP_STUDY_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.sessionStorage.removeItem(TEMP_STUDY_STORAGE_KEY);
    return null;
  }
}

export function clearTemporaryStudy() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(TEMP_STUDY_STORAGE_KEY);
}

export function clearTemporaryStudyResults() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(getTemporaryStudyResultsStorageKey(TEMP_FAILED_STUDY_SOURCE_ID));
  window.sessionStorage.removeItem(getTemporaryStudyResultsStorageKey(TEMP_LIBRARY_STUDY_SOURCE_ID));
}

export function hasTemporaryStudy() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(TEMP_STUDY_STORAGE_KEY) !== null;
}

export function hasTemporaryStudyResults() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.sessionStorage.getItem(getTemporaryStudyResultsStorageKey(TEMP_FAILED_STUDY_SOURCE_ID)) !==
      null ||
    window.sessionStorage.getItem(getTemporaryStudyResultsStorageKey(TEMP_LIBRARY_STUDY_SOURCE_ID)) !==
      null
  );
}
