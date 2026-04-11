import Link from "next/link";
import type { ReactNode } from "react";

import type { LibraryFolderSummary, LibraryListSummary } from "@/lib/data/libraries";

export type LibraryBreadcrumbItem = {
  href?: string;
  label: string;
};

type LibraryNavigationContentProps = {
  breadcrumbs: LibraryBreadcrumbItem[];
  emptyDescription: string;
  emptyTitle: string;
  folders: LibraryFolderSummary[];
  lists: LibraryListSummary[];
  parentTitle?: string;
  sectionDescription?: string | null;
  sectionTitle: string;
  topContent?: ReactNode;
  t: {
    emptyFolders: string;
    emptyLists: string;
    foldersHeading: string;
    listsHeading: string;
    openFolder: string;
  };
};

export function LibraryNavigationContent({
  breadcrumbs,
  emptyDescription,
  emptyTitle,
  folders,
  lists,
  parentTitle,
  sectionDescription,
  sectionTitle,
  topContent,
  t,
}: LibraryNavigationContentProps) {
  const hasContents = folders.length > 0 || lists.length > 0;

  return (
    <div className="space-y-7">
      <nav
        aria-label="Breadcrumb"
        className="rounded-[1.5rem] border border-border bg-card/70 px-4 py-3 shadow-sm backdrop-blur"
      >
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => {
            const isCurrentPage = index === breadcrumbs.length - 1;

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.href && !isCurrentPage ? (
                  <Link href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isCurrentPage ? "font-medium text-foreground" : undefined}>
                    {item.label}
                  </span>
                )}
                {!isCurrentPage ? <span aria-hidden="true">/</span> : null}
              </li>
            );
          })}
        </ol>
      </nav>

      <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
        <div className="space-y-2">
          {parentTitle ? (
            <p className="text-sm font-semibold text-muted-foreground">{parentTitle}</p>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{sectionTitle}</h1>
          {sectionDescription ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {sectionDescription}
            </p>
          ) : null}
        </div>
      </section>

      {topContent}

      {!hasContents ? (
        <section className="rounded-[2.25rem] border border-dashed border-border bg-card/70 p-6 text-center shadow-sm backdrop-blur">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{emptyTitle}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{emptyDescription}</p>
          </div>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {t.foldersHeading}
              </h2>
              {folders.length === 0 ? (
                <p className="text-sm leading-6 text-muted-foreground">{t.emptyFolders}</p>
              ) : (
                <div className="grid gap-3">
                  {folders.map((folder) => (
                    <Link
                      key={folder.id}
                      href={`/libraries/${folder.libraryId}/folders/${folder.id}`}
                      className="group rounded-[1.5rem] border border-border bg-background/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary/30 hover:shadow-sm active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                          {folder.title}
                        </h3>
                        <span className="text-sm text-muted-foreground">{t.openFolder}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {t.listsHeading}
              </h2>
              {lists.length === 0 ? (
                <p className="text-sm leading-6 text-muted-foreground">{t.emptyLists}</p>
              ) : (
                <div className="grid gap-3">
                  {lists.map((list) => (
                    <Link
                      key={list.id}
                      href={`/libraries/${list.libraryId}/lists/${list.id}`}
                      className="rounded-[1.5rem] border border-border bg-background/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary/30 hover:shadow-md active:scale-[0.99]"
                    >
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                          {list.title}
                        </h3>
                        {list.description ? (
                          <p className="text-sm leading-6 text-muted-foreground">
                            {list.description}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
