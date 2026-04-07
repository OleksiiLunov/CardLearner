import { notFound, redirect } from "next/navigation";

import { StudySetupForm } from "@/components/study/study-setup-form";
import { getListByIdForUser } from "@/lib/data/lists";
import { requireUser } from "@/lib/supabase/session";

type StudySetupPageProps = {
  searchParams: Promise<{
    listId?: string;
  }>;
};

export default async function StudySetupPage({ searchParams }: StudySetupPageProps) {
  const user = await requireUser();
  const { listId } = await searchParams;

  if (!listId) {
    redirect("/lists");
  }

  const list = await getListByIdForUser(listId, user.id);

  if (!list) {
    notFound();
  }

  const hasItems = list.items.length > 0;

  return (
    <StudySetupForm
      hasItems={hasItems}
      itemCount={list.items.length}
      listId={list.id}
      listName={list.name}
    />
  );
}
