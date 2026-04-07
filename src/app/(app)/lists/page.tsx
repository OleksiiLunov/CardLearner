import { ListsOverview } from "@/components/lists/lists-overview";
import { getListsByUser } from "@/lib/data/lists";
import { requireUser } from "@/lib/supabase/session";

type ListsOverviewPageProps = {
  searchParams: Promise<{
    deleted?: string;
  }>;
};

export default async function ListsOverviewPage({ searchParams }: ListsOverviewPageProps) {
  const user = await requireUser();
  const lists = await getListsByUser(user.id);
  const { deleted } = await searchParams;

  return <ListsOverview deleted={Boolean(deleted)} lists={lists} userEmail={user.email} />;
}
