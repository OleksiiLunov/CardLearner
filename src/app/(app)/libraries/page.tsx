import Link from "next/link";

import { createLibraryAction } from "@/app/actions/libraries";
import { CreateLibraryDialogAction } from "@/components/libraries/create-library-dialog-action";
import { SectionIntro } from "@/components/ui/section-intro";
import { getLibrariesForBrowsing, getLibrariesForOwner } from "@/lib/data/libraries";
import { getServerLocale } from "@/i18n/get-server-locale";
import { translations } from "@/locales";
import { requireUser } from "@/lib/supabase/session";

type LibrariesPageProps = {
  searchParams: Promise<{
    scope?: string;
  }>;
};

type LibraryScope = "all" | "mine";

function resolveLibraryScope(scope?: string): LibraryScope {
  return scope === "mine" ? "mine" : "all";
}

function formatLibraryDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function LibrariesPage({ searchParams }: LibrariesPageProps) {
  const [{ scope }, locale, user] = await Promise.all([
    searchParams,
    getServerLocale(),
    requireUser(),
  ]);

  const t = translations[locale];
  const currentScope = resolveLibraryScope(scope);
  const currentUser = user;
  const libraries =
    currentScope === "mine"
      ? await getLibrariesForOwner(currentUser.id)
      : await getLibrariesForBrowsing();
  const dateLocale = locale === "uk" ? "uk-UA" : "en-US";

  return (
    <div className="space-y-7">
      <SectionIntro
        eyebrow={t.libraries.eyebrow}
        title={t.libraries.title}
        description={t.libraries.description}
      />

      <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/libraries"
              aria-current={currentScope === "all" ? "page" : undefined}
              className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 ${
                currentScope === "all"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-secondary/70 hover:shadow-md"
              }`}
            >
              {t.libraries.all}
            </Link>
            <Link
              href="/libraries?scope=mine"
              aria-current={currentScope === "mine" ? "page" : undefined}
              className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 ${
                currentScope === "mine"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-secondary/70 hover:shadow-md"
              }`}
            >
              {t.libraries.mine}
            </Link>
          </div>
          <CreateLibraryDialogAction action={createLibraryAction} />
        </div>
      </section>

      {libraries.length === 0 ? (
        <section className="rounded-[2.25rem] border border-dashed border-border bg-card/70 p-6 text-center shadow-sm backdrop-blur">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {currentScope === "mine" ? t.libraries.emptyMineTitle : t.libraries.emptyAllTitle}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {currentScope === "mine"
                ? t.libraries.emptyMineDescription
                : t.libraries.emptyAllDescription}
            </p>
          </div>
        </section>
      ) : (
        <div className="grid gap-4">
          {libraries.map((library) => (
            <Link
              key={library.id}
              href={`/libraries/${library.id}`}
              className="group rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {library.title}
                  </h2>
                  {library.description ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {library.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t.libraries.updatedLabel} {formatLibraryDate(library.updatedAt, dateLocale)}
                  </p>
                  <p className="text-sm font-medium text-foreground/90">{t.libraries.viewDetails}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
