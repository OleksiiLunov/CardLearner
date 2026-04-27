import { notFound } from "next/navigation";

import { ListDetails } from "@/components/lists/list-details";
import { getListByIdForUser } from "@/lib/data/lists";
import { requireUser } from "@/lib/supabase/session";

type ListDetailsPageProps = {
  params: Promise<{
    listId: string;
  }>;
  searchParams: Promise<{
    created?: string;
    updated?: string;
  }>;
};

export default async function ListDetailsPage({
  params,
  searchParams,
}: ListDetailsPageProps) {
  const pageStartedAt = performance.now();

  try {
    const user = await requireUser();
    const { listId } = await params;
    const { created, updated } = await searchParams;
    const list = await getListByIdForUser(listId, user.id, "[perf] list-details:getList");

    if (!list) {
      notFound();
    }

    return <ListDetails created={Boolean(created)} updated={Boolean(updated)} list={list} />;
  } finally {
    console.log(`[perf] list-details:page ${Math.round(performance.now() - pageStartedAt)}ms`);
  }
}
