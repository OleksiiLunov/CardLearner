"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";

import { StudySetupForm } from "@/components/study/study-setup-form";
import { TemporaryStudyFallback } from "@/components/study/temporary-study-fallback";
import {
  readNormalStudySetupSourcePayload,
  saveNormalStudySetupSourcePayload,
} from "@/lib/study/storage";
import { readTemporaryStudy } from "@/lib/study/temp-study-storage";
import type {
  NormalStudySetupSourcePayload,
  TemporaryStudyPayload,
} from "@/lib/study/types";
import { useTranslation } from "@/i18n/useTranslation";

type NormalStudySetupResponse =
  | {
      status: "ok";
      source: NormalStudySetupSourcePayload;
    }
  | {
      status: "not-found" | "unauthorized";
    };

type NormalStudySetupProps = {
  listId: string;
};

export function NormalStudySetup({ listId }: NormalStudySetupProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [payload, setPayload] = useState<NormalStudySetupSourcePayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const storedPayload = readNormalStudySetupSourcePayload();

    if (storedPayload && storedPayload.listId === listId) {
      setPayload(storedPayload);
      setLoaded(true);
      return;
    }

    async function loadFallback() {
      const response = await fetch(`/study/setup/data?listId=${encodeURIComponent(listId)}`, {
        cache: "no-store",
      });
      const fallbackPayload = (await response.json()) as NormalStudySetupResponse;

      if (cancelled) {
        return;
      }

      if (fallbackPayload.status === "unauthorized") {
        router.replace("/login");
        return;
      }

      if (fallbackPayload.status === "not-found") {
        setMissing(true);
        setLoaded(true);
        return;
      }

      if (fallbackPayload.status !== "ok") {
        router.replace(`/lists/${encodeURIComponent(listId)}`);
        return;
      }

      saveNormalStudySetupSourcePayload(fallbackPayload.source);
      setPayload(fallbackPayload.source);
      setLoaded(true);
    }

    loadFallback().catch(() => {
      if (cancelled) {
        return;
      }

      router.replace(`/lists/${encodeURIComponent(listId)}`);
    });

    return () => {
      cancelled = true;
    };
  }, [listId, router]);

  if (missing) {
    notFound();
  }

  if (!loaded || !payload) {
    return (
      <section className="rounded-[2rem] border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </section>
    );
  }

  return (
    <StudySetupForm
      hasItems={payload.items.length > 0}
      itemCount={payload.items.length}
      listName={payload.listName}
      normalStudySource={{
        listId: payload.listId,
        items: payload.items,
      }}
      hiddenFields={[{ name: "listId", value: payload.listId }]}
      backHref={`/lists/${payload.listId}`}
    />
  );
}

export function TemporaryStudySetup() {
  const { t } = useTranslation();
  const [payload, setPayload] = useState<TemporaryStudyPayload | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedPayload = readTemporaryStudy();
    setPayload(storedPayload);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <section className="rounded-[2rem] border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </section>
    );
  }

  if (!payload) {
    return <TemporaryStudyFallback backHref="/lists/temp/failed" />;
  }

  const currentPayload = payload;

  return (
    <StudySetupForm
      hasItems={currentPayload.items.length > 0}
      itemCount={currentPayload.items.length}
      listName={currentPayload.title}
      hiddenFields={[{ name: "source", value: currentPayload.source.queryValue }]}
      backHref={currentPayload.source.backHref}
    />
  );
}
