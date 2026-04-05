import { notFound, redirect } from "next/navigation";

import { StudyResults } from "@/components/study/study-results";
import { getListByIdForUser } from "@/lib/data/lists";
import { requireUser } from "@/lib/supabase/session";

type StudyResultsPageProps = {
  searchParams: Promise<{
    listId?: string;
  }>;
};

export default async function StudyResultsPage({ searchParams }: StudyResultsPageProps) {
  const user = await requireUser();
  const { listId } = await searchParams;

  if (!listId) {
    redirect("/lists");
  }

  const list = await getListByIdForUser(listId, user.id);

  if (!list) {
    notFound();
  }

  return <StudyResults listId={list.id} listName={list.name} />;
}
