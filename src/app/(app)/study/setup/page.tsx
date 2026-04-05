import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getListByIdForUser } from "@/lib/data/lists";
import { requireUser } from "@/lib/supabase/session";

type StudySetupPageProps = {
  searchParams: Promise<{
    listId?: string;
  }>;
};

export default async function StudySetupPage({ searchParams }: StudySetupPageProps) {
  const user = await requireUser();
  const { listId } = await searchParams;

  if (!listId) {
    redirect("/lists");
  }

  const list = await getListByIdForUser(listId, user.id);

  if (!list) {
    notFound();
  }

  const hasItems = list.items.length > 0;

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Study Setup
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground">
            {list.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {list.items.length} item{list.items.length === 1 ? "" : "s"} ready for review.
          </p>
        </div>
      </section>

      <form action="/study/session" className="space-y-6 rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
        <input type="hidden" name="listId" value={list.id} />

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">Initial side</legend>
          <label className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-background px-4 py-3">
            <input type="radio" name="initialSide" value="front" defaultChecked />
            <span className="text-sm text-foreground">Front first</span>
          </label>
          <label className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-background px-4 py-3">
            <input type="radio" name="initialSide" value="back" />
            <span className="text-sm text-foreground">Back first</span>
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">Order</legend>
          <label className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-background px-4 py-3">
            <input type="radio" name="order" value="original" defaultChecked />
            <span className="text-sm text-foreground">Original</span>
          </label>
          <label className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-background px-4 py-3">
            <input type="radio" name="order" value="random" />
            <span className="text-sm text-foreground">Random</span>
          </label>
        </fieldset>

        {!hasItems ? (
          <p className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            This list has no items to study yet.
          </p>
        ) : null}

        <div className="grid gap-3">
          <Button type="submit" className="w-full" disabled={!hasItems}>
            Start study
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href={`/lists/${list.id}`}>Back to list</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
