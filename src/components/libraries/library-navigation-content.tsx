import Link from "next/link";
import type { ReactNode } from "react";
import { BookText, Folder } from "lucide-react";

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

type LibraryContentItem =
  | {
      type: "folder";
      id: string;
      href: string;
      title: string;
    }
  | {
      type: "list";
      description: string | null;
      href: string;
      id: string;
      title: string;
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
  const contentItems: LibraryContentItem[] = [
    ...folders.map((folder): LibraryContentItem => ({
      type: "folder",
      id: folder.id,
      href: `/libraries/${folder.libraryId}/folders/${folder.id}`,
      title: folder.title,
    })),
    ...lists.map((list): LibraryContentItem => ({
      type: "list",
      id: list.id,
      href: `/libraries/${list.libraryId}/lists/${list.id}`,
      title: list.title,
      description: list.description,
    })),
  ];
  const hasContents = contentItems.length > 0;

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
        <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
          <div className="grid gap-3">
            {contentItems.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className={
                  item.type === "folder"
                    ? "group rounded-[1.5rem] border border-amber-200/80 bg-amber-50/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100/70 hover:shadow-sm active:scale-[0.99]"
                    : "group rounded-[1.5rem] border border-sky-200/80 bg-sky-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-100/60 hover:shadow-sm active:scale-[0.99]"
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {item.type === "folder" ? (
                        <>
                          <Folder className="h-4 w-4 text-amber-700" aria-hidden="true" />
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                            {t.foldersHeading}
                          </span>
                        </>
                      ) : (
                        <>
                          <BookText className="h-4 w-4 text-sky-700" aria-hidden="true" />
                          <span className="rounded-full border border-sky-200 bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-900">
                            {t.listsHeading}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    {item.type === "list" && item.description ? (
                      <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                    ) : null}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.type === "folder" ? t.openFolder : t.listsHeading}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
