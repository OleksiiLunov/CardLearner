import type { StudyCard, TemporaryStudyPayload } from "@/lib/study/types";

export const TEMP_FAILED_STUDY_SOURCE_ID = "temp-failed";
export const TEMP_FAILED_STUDY_QUERY_VALUE = "temp-failed";

const TEMP_STUDY_STORAGE_KEY = "study:temp:failed";
const TEMP_STUDY_RESULTS_STORAGE_KEY = `study-results:${TEMP_FAILED_STUDY_SOURCE_ID}`;

function isStudyCard(value: unknown): value is StudyCard {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.id === "string" &&
    typeof value.front === "string" &&
    typeof value.back === "string" &&
    typeof value.position === "number"
  );
}

function isTemporaryStudyPayload(value: unknown): value is TemporaryStudyPayload {
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
    value.kind === "temp-failed" &&
    "title" in value &&
    typeof value.title === "string" &&
    "items" in value &&
    Array.isArray(value.items) &&
    value.items.every(isStudyCard) &&
    source !== null &&
    typeof source.listId === "string" &&
    typeof source.listName === "string"
  );
}

export function getTemporaryStudyResultsStorageKey() {
  return TEMP_STUDY_RESULTS_STORAGE_KEY;
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

  window.sessionStorage.removeItem(TEMP_STUDY_RESULTS_STORAGE_KEY);
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

  return window.sessionStorage.getItem(TEMP_STUDY_RESULTS_STORAGE_KEY) !== null;
}
