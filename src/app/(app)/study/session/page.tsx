import { redirect } from "next/navigation";

import { StudySessionRoute } from "@/components/study/study-session-route";
import { TemporaryStudySessionRoute } from "@/components/study/temporary-study-session-route";
import { isTemporaryStudySourceQueryValue } from "@/lib/study/temp-study-storage";

type StudySessionPageProps = {
  searchParams: Promise<{
    listId?: string;
    source?: string;
    initialSide?: string;
    order?: string;
  }>;
};

export default async function StudySessionPage({ searchParams }: StudySessionPageProps) {
  const pageStartedAt = performance.now();

  try {
    const { listId, source, initialSide, order } = await searchParams;

    if (isTemporaryStudySourceQueryValue(source ?? null)) {
      return <TemporaryStudySessionRoute />;
    }

    if (!listId) {
      redirect("/lists");
    }

    return <StudySessionRoute listId={listId} initialSide={initialSide ?? null} order={order ?? null} />;
  } finally {
    console.log(`[perf] start-study:page ${Math.round(performance.now() - pageStartedAt)}ms`);
  }
}
