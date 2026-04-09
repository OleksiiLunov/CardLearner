import type { StudyInitialSide, StudyOrder } from "@/lib/study/types";

export type TemporaryListItem = {
  id: string;
  front: string;
  back: string;
  position: number;
};

export type TemporaryFailedListPayload = {
  kind: "failed-items";
  title: string;
  items: TemporaryListItem[];
  itemCount: number;
  source: {
    listId: string;
    listName: string;
    initialSide: StudyInitialSide;
    order: StudyOrder;
  };
};
