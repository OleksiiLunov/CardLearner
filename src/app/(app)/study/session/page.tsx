import { notFound, redirect } from "next/navigation";

import { StudySession } from "@/components/study/study-session";
import { TemporaryStudySessionRoute } from "@/components/study/temporary-study-session-route";
import { getListByIdForUser } from "@/lib/data/lists";
import { TEMP_FAILED_STUDY_QUERY_VALUE } from "@/lib/study/temp-study-storage";
import type { StudyInitialSide, StudyOrder } from "@/lib/study/types";
import { requireUser } from "@/lib/supabase/session";

type StudySessionPageProps = {
  searchParams: Promise<{
    listId?: string;
    source?: string;
    initialSide?: string;
    order?: string;
  }>;
};

export default async function StudySessionPage({ searchParams }: StudySessionPageProps) {
  const { listId, source, initialSide, order } = await searchParams;

  if (source === TEMP_FAILED_STUDY_QUERY_VALUE) {
    return <TemporaryStudySessionRoute />;
  }

  const user = await requireUser();

  if (!listId) {
    redirect("/lists");
  }

  if (initialSide !== "front" && initialSide !== "back") {
    redirect(`/study/setup?listId=${encodeURIComponent(listId)}`);
  }

  if (order !== "original" && order !== "random") {
    redirect(`/study/setup?listId=${encodeURIComponent(listId)}`);
  }

  const list = await getListByIdForUser(listId, user.id);

  if (!list) {
    notFound();
  }

  if (list.items.length === 0) {
    redirect(`/study/setup?listId=${encodeURIComponent(list.id)}`);
  }

  return (
    <StudySession
      listId={list.id}
      listName={list.name}
      initialSide={initialSide as StudyInitialSide}
      order={order as StudyOrder}
      items={list.items.map((item) => ({
        id: item.id,
        front: item.front,
        back: item.back,
        position: item.position,
      }))}
    />
  );
}
