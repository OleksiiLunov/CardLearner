export type StudyInitialSide = "front" | "back";
export type StudyOrder = "original" | "random";

export type StudyCard = {
  id: string;
  front: string;
  back: string;
  position: number;
};

export type StudySessionData = {
  listId: string;
  listName: string;
  items: StudyCard[];
};

export type NormalStudySessionPayload = StudySessionData & {
  kind: "saved-list";
  initialSide: StudyInitialSide;
  order: StudyOrder;
};

export type NormalStudySetupSourcePayload = StudySessionData & {
  kind: "saved-list-source";
};

export type TemporaryStudyKind = "temp-failed" | "library-list";

export type TemporaryStudyPayload = {
  kind: TemporaryStudyKind;
  title: string;
  items: StudyCard[];
  source: {
    listId: string;
    listName: string;
    sourceId: string;
    queryValue: string;
    backHref: string;
  };
};

export type StudyResultsPayload = {
  listId: string;
  listName: string;
  totalItems: number;
  guessedCount: number;
  failedCount: number;
  failedItems: StudyCard[];
  initialSide: StudyInitialSide;
  order: StudyOrder;
};
