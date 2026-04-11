import { notFound, redirect } from "next/navigation";

import { StudyResults } from "@/components/study/study-results";
import { TemporaryStudyResultsRoute } from "@/components/study/temporary-study-results-route";
import { getListByIdForUser } from "@/lib/data/lists";
import { isTemporaryStudySourceQueryValue } from "@/lib/study/temp-study-storage";
import { requireUser } from "@/lib/supabase/session";

type StudyResultsPageProps = {
  searchParams: Promise<{
    listId?: string;
    source?: string;
  }>;
};

export default async function StudyResultsPage({ searchParams }: StudyResultsPageProps) {
  const { listId, source } = await searchParams;

  if (isTemporaryStudySourceQueryValue(source ?? null)) {
    return <TemporaryStudyResultsRoute />;
  }

  const user = await requireUser();

  if (!listId) {
    redirect("/lists");
  }

  const list = await getListByIdForUser(listId, user.id);

  if (!list) {
    notFound();
  }

  return <StudyResults listId={list.id} listName={list.name} />;
}
