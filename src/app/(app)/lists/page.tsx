import Link from "next/link";

import { ListSummaryCard } from "@/components/lists/list-summary-card";
import { getListsByUser } from "@/lib/data/lists";
import { Button } from "@/components/ui/button";
import { SectionIntro } from "@/components/ui/section-intro";
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

  return (
    <div className="space-y-7">
      <SectionIntro
        eyebrow="Your Lists"
        title="Keep vocabulary collections organized and ready for study."
        description="Build and manage your own language lists. Data is now loaded from your database and scoped to your account."
      />

      {deleted ? (
        <p className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          List deleted successfully.
        </p>
      ) : null}

      <div className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">Collections</p>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Signed in as {user.email ?? "unknown user"}. Lists below are now loaded from your
              database records.
            </p>
          </div>
          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link href="/lists/new">Create list</Link>
          </Button>
        </div>
      </div>

      {lists.length === 0 ? (
        <section className="rounded-[2.25rem] border border-dashed border-border bg-card/70 p-6 text-center shadow-sm backdrop-blur">
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">No lists yet</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Start with a small vocabulary set and build from there. Your study flow is ready as
                soon as the first list exists.
              </p>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href="/lists/new">Create your first list</Link>
            </Button>
          </div>
        </section>
      ) : (
        <div className="grid gap-4">
          {lists.map((list) => (
            <ListSummaryCard
              key={list.id}
              href={`/lists/${list.id}`}
              name={list.name}
              itemCount={list.items.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
