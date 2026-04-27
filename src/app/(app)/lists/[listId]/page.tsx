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
    const authStartedAt = performance.now();
    const user = await requireUser();
    console.log(`[perf] list-details:requireUser ${Math.round(performance.now() - authStartedAt)}ms`);
    const { listId } = await params;
    const { created, updated } = await searchParams;
    const list = await getListByIdForUser(listId, user.id, "[perf] list-details:getList");

    if (!list) {
      notFound();
    }

    const serializeStartedAt = performance.now();
    const listDetails = {
      id: list.id,
      name: list.name,
      items: list.items.map((item) => ({
        id: item.id,
        front: item.front,
        back: item.back,
        position: item.position,
      })),
    };
    console.log(
      `[perf] list-details:serializeProps ${Math.round(performance.now() - serializeStartedAt)}ms`,
    );

    return <ListDetails created={Boolean(created)} updated={Boolean(updated)} list={listDetails} />;
  } finally {
    console.log(`[perf] list-details:page ${Math.round(performance.now() - pageStartedAt)}ms`);
  }
}
