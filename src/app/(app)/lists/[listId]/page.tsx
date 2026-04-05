import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteListDialog } from "@/components/lists/delete-list-dialog";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="space-y-7">
      {created ? (
        <p className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          List created successfully.
        </p>
      ) : null}
      {updated ? (
        <p className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          List updated successfully.
        </p>
      ) : null}

      <section className="space-y-6 rounded-[2.25rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            List Details
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">{list.name}</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {list.items.length} item{list.items.length === 1 ? "" : "s"} ready for future study flows.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Button asChild className="w-full">
            <Link href={`/study/setup?listId=${encodeURIComponent(list.id)}`}>Study</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href={`/lists/${list.id}/edit`}>Edit</Link>
          </Button>
          <DeleteListDialog listId={list.id} listName={list.name} />
        </div>
      </section>

      <section className="space-y-4">
        {list.items.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.75rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2.5 rounded-[1.25rem] bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Front
                </p>
                <p className="text-base font-medium leading-7 text-foreground">{item.front}</p>
              </div>
              <div className="space-y-2.5 rounded-[1.25rem] bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Back
                </p>
                <p className="text-base font-medium leading-7 text-foreground">{item.back}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
