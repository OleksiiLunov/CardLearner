"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";

import { StudySession } from "@/components/study/study-session";
import { useTranslation } from "@/i18n/useTranslation";
import { readNormalStudySessionPayload } from "@/lib/study/storage";
import type {
  StudyInitialSide,
  StudyOrder,
  StudySessionData,
} from "@/lib/study/types";

type StudySessionRouteProps = {
  listId: string;
  initialSide: string | null;
  order: string | null;
};

type StudySessionFallbackResponse =
  | {
      status: "ok";
      session: StudySessionData;
    }
  | {
      status: "empty" | "not-found" | "unauthorized";
    };

export function StudySessionRoute({
  listId,
  initialSide,
  order,
}: StudySessionRouteProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [session, setSession] = useState<StudySessionData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const pageStartedAt = performance.now();

    function finishPageLog() {
      console.log(`[perf] start-study:page ${Math.round(performance.now() - pageStartedAt)}ms`);
    }

    if (initialSide !== "front" && initialSide !== "back") {
      router.replace(`/study/setup?listId=${encodeURIComponent(listId)}`);
      finishPageLog();
      return;
    }

    if (order !== "original" && order !== "random") {
      router.replace(`/study/setup?listId=${encodeURIComponent(listId)}`);
      finishPageLog();
      return;
    }

    const storageStartedAt = performance.now();
    const stored = readNormalStudySessionPayload();
    console.log(`[perf] start-study:prepareSession ${Math.round(performance.now() - storageStartedAt)}ms`);

    if (
      stored &&
      stored.listId === listId &&
      stored.initialSide === initialSide &&
      stored.order === order &&
      stored.items.length > 0
    ) {
      setSession({
        listId: stored.listId,
        listName: stored.listName,
        items: stored.items,
      });
      setLoaded(true);
      finishPageLog();
      return;
    }

    async function loadFallback() {
      const response = await fetch(`/study/session/data?listId=${encodeURIComponent(listId)}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as StudySessionFallbackResponse;

      if (cancelled) {
        return;
      }

      if (payload.status === "unauthorized") {
        router.replace("/login");
        finishPageLog();
        return;
      }

      if (payload.status === "not-found") {
        setMissing(true);
        setLoaded(true);
        finishPageLog();
        return;
      }

      if (payload.status === "empty") {
        router.replace(`/study/setup?listId=${encodeURIComponent(listId)}`);
        finishPageLog();
        return;
      }

      if (payload.status !== "ok") {
        router.replace(`/study/setup?listId=${encodeURIComponent(listId)}`);
        finishPageLog();
        return;
      }

      setSession(payload.session);
      setLoaded(true);
      finishPageLog();
    }

    loadFallback().catch(() => {
      if (cancelled) {
        return;
      }

      router.replace(`/study/setup?listId=${encodeURIComponent(listId)}`);
      finishPageLog();
    });

    return () => {
      cancelled = true;
    };
  }, [initialSide, listId, order, router]);

  if (missing) {
    notFound();
  }

  if (!loaded || !session) {
    return (
      <section className="rounded-[2rem] border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </section>
    );
  }

  return (
    <StudySession
      listId={session.listId}
      listName={session.listName}
      initialSide={initialSide as StudyInitialSide}
      order={order as StudyOrder}
      items={session.items}
    />
  );
}
