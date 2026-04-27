import type {
  NormalStudySessionPayload,
  StudyCard,
  StudyInitialSide,
  StudyOrder,
} from "@/lib/study/types";

const NORMAL_STUDY_SESSION_STORAGE_KEY = "study:session:normal";

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

function isStudyInitialSide(value: unknown): value is StudyInitialSide {
  return value === "front" || value === "back";
}

function isStudyOrder(value: unknown): value is StudyOrder {
  return value === "original" || value === "random";
}

function isNormalStudySessionPayload(value: unknown): value is NormalStudySessionPayload {
  const payload = asRecord(value);

  if (!payload) {
    return false;
  }

  return (
    payload.kind === "saved-list" &&
    typeof payload.listId === "string" &&
    typeof payload.listName === "string" &&
    Array.isArray(payload.items) &&
    payload.items.every(isStudyCard) &&
    isStudyInitialSide(payload.initialSide) &&
    isStudyOrder(payload.order)
  );
}

export function saveNormalStudySessionPayload(payload: NormalStudySessionPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(NORMAL_STUDY_SESSION_STORAGE_KEY, JSON.stringify(payload));
}

export function readNormalStudySessionPayload(): NormalStudySessionPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(NORMAL_STUDY_SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isNormalStudySessionPayload(parsed)) {
      window.sessionStorage.removeItem(NORMAL_STUDY_SESSION_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.sessionStorage.removeItem(NORMAL_STUDY_SESSION_STORAGE_KEY);
    return null;
  }
}

export function getStudyResultsStorageKey(listId: string) {
  return `study-results:${listId}`;
}
