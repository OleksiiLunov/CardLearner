export type StudyInitialSide = "front" | "back";
export type StudyOrder = "original" | "random";

export type StudyCard = {
  id: string;
  front: string;
  back: string;
  position: number;
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
