import { redirect } from "next/navigation";

import { NormalStudySetup } from "@/components/study/temporary-study-setup";
import { TemporaryStudySetup } from "@/components/study/temporary-study-setup";
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

  if (!listId) {
    redirect("/lists");
  }

  await requireUser();

  return <NormalStudySetup listId={listId} />;
}
