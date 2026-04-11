import { notFound, redirect } from "next/navigation";

import { StudySetupForm } from "@/components/study/study-setup-form";
import { TemporaryStudySetup } from "@/components/study/temporary-study-setup";
import { getListByIdForUser } from "@/lib/data/lists";
import { isTemporaryStudySourceQueryValue } from "@/lib/study/temp-study-storage";
import { requireUser } from "@/lib/supabase/session";

type StudySetupPageProps = {
  searchParams: Promise<{
    listId?: string;
    source?: string;
  }>;
};

export default async function StudySetupPage({ searchParams }: StudySetupPageProps) {
  const { listId, source } = await searchParams;

  if (isTemporaryStudySourceQueryValue(source ?? null)) {
    return <TemporaryStudySetup />;
  }

  const user = await requireUser();

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
      listName={list.name}
      hiddenFields={[{ name: "listId", value: list.id }]}
      backHref={`/lists/${list.id}`}
    />
  );
}
