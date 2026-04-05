"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { StudyCard, StudyInitialSide, StudyOrder, StudyResultsPayload } from "@/lib/study/types";
import { shuffleStudyCards } from "@/lib/study/utils";

type StudySessionProps = {
  listId: string;
  listName: string;
  initialSide: StudyInitialSide;
  order: StudyOrder;
  items: StudyCard[];
};

function getResultsStorageKey(listId: string) {
  return `study-results:${listId}`;
}

export function StudySession({
  listId,
  listName,
  initialSide,
  order,
  items,
}: StudySessionProps) {
  const router = useRouter();
  const orderedItems = useMemo(
    () => (order === "random" ? shuffleStudyCards(items) : [...items]),
    [items, order],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [failedItems, setFailedItems] = useState<StudyCard[]>([]);
  const [guessedCount, setGuessedCount] = useState(0);

  const currentItem = orderedItems[currentIndex];
  const isFrontFirst = initialSide === "front";
  const visiblePrimary = isFrontFirst ? currentItem.front : currentItem.back;
  const visibleSecondary = isFrontFirst ? currentItem.back : currentItem.front;

  function finishSession(nextGuessedCount: number, nextFailedItems: StudyCard[]) {
    const results: StudyResultsPayload = {
      listId,
      listName,
      totalItems: orderedItems.length,
      guessedCount: nextGuessedCount,
      failedCount: nextFailedItems.length,
      failedItems: nextFailedItems,
      initialSide,
      order,
    };

    sessionStorage.setItem(getResultsStorageKey(listId), JSON.stringify(results));
    router.push(`/study/results?listId=${encodeURIComponent(listId)}`);
  }

  function moveNext(didGuess: boolean) {
    const nextFailedItems = didGuess ? failedItems : [...failedItems, currentItem];
    const nextGuessedCount = didGuess ? guessedCount + 1 : guessedCount;
    const nextIndex = currentIndex + 1;

    if (nextIndex >= orderedItems.length) {
      finishSession(nextGuessedCount, nextFailedItems);
      return;
    }

    setFailedItems(nextFailedItems);
    setGuessedCount(nextGuessedCount);
    setCurrentIndex(nextIndex);
    setRevealed(false);
  }

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Study Session
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{listName}</h1>
          </div>
          <p className="rounded-full bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground">
            {currentIndex + 1} / {orderedItems.length}
          </p>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setRevealed(true)}
        className={`group flex min-h-[24rem] w-full flex-col justify-center rounded-[2.75rem] border p-7 text-center shadow-sm backdrop-blur transition-all duration-200 sm:min-h-[26rem] sm:p-10 ${
          revealed
            ? "border-primary/25 bg-secondary/55 shadow-md"
            : "cursor-pointer border-border bg-card/88 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.995]"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {revealed ? "Revealed" : "Tap To Reveal"}
        </p>
        <div className="mt-7 space-y-7">
          <p className={`text-balance font-semibold tracking-tight text-foreground transition-all duration-200 ${revealed ? "text-3xl sm:text-4xl" : "text-4xl sm:text-[2.75rem] group-hover:scale-[1.01]"}`}>
            {visiblePrimary}
          </p>
          {revealed ? (
            <div className="animate-in fade-in space-y-3 border-t border-primary/15 pt-6 duration-200">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Other Side
              </p>
              <p className="text-balance text-2xl font-medium leading-9 text-foreground sm:text-[2rem]">
                {visibleSecondary}
              </p>
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Tap the card when you are ready to check the answer.
            </p>
          )}
        </div>
      </button>

      {revealed ? (
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" size="lg" className="w-full" onClick={() => moveNext(false)}>
            Didnt guess
          </Button>
          <Button type="button" size="lg" className="w-full" onClick={() => moveNext(true)}>
            Guessed
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm leading-6 text-muted-foreground">
          Reveal the card to record whether you got it right.
        </p>
      )}
    </div>
  );
}
