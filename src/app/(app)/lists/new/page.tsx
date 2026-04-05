import { createListAction } from "@/app/actions/lists";
import { ListForm } from "@/components/lists/list-form";

export default function CreateListPage() {
  return <ListForm mode="create" action={createListAction} />;
}
