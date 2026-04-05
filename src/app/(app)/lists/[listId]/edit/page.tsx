import { notFound } from "next/navigation";

import { updateListAction } from "@/app/actions/lists";
import { ListForm } from "@/components/lists/list-form";
import { getListByIdForUser } from "@/lib/data/lists";
import { formatListItemsForTextarea } from "@/lib/lists/format-list-items";
import { requireUser } from "@/lib/supabase/session";

type EditListPageProps = {
  params: Promise<{
    listId: string;
  }>;
};

export default async function EditListPage({ params }: EditListPageProps) {
  const user = await requireUser();
  const { listId } = await params;
  const list = await getListByIdForUser(listId, user.id);

  if (!list) {
    notFound();
  }

  return (
    <ListForm
      mode="edit"
      action={updateListAction.bind(null, listId)}
      initialValues={{
        name: list.name,
        rawItems: formatListItemsForTextarea(list.items),
      }}
    />
  );
}
