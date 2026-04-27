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
  const user = await requireUser();
  const { listId } = await params;
  const { created, updated } = await searchParams;
  const list = await getListByIdForUser(listId, user.id);

  if (!list) {
    notFound();
  }

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

  return <ListDetails created={Boolean(created)} updated={Boolean(updated)} list={listDetails} />;
}
