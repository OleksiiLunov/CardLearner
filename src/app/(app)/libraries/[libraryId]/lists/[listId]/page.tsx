import Link from "next/link";
import { notFound } from "next/navigation";

import {
  downloadLibraryListAction,
  updateLibraryListAction,
} from "@/app/actions/libraries";
import { LibraryListDetails } from "@/components/libraries/library-list-details";
import { getServerLocale } from "@/i18n/get-server-locale";
import {
  getLibraryById,
  getLibraryFolderBreadcrumbs,
  getLibraryListById,
} from "@/lib/data/libraries";
import { formatListItemsForTextarea } from "@/lib/lists/format-list-items";
import { translations } from "@/locales";
import { requireUser } from "@/lib/supabase/session";

type LibraryListDetailsPageProps = {
  params: Promise<{
    libraryId: string;
    listId: string;
  }>;
};

export default async function LibraryListDetailsPage({ params }: LibraryListDetailsPageProps) {
  const [{ libraryId, listId }, locale, user] = await Promise.all([
    params,
    getServerLocale(),
    requireUser(),
  ]);
  const t = translations[locale];
  const [library, libraryList] = await Promise.all([
    getLibraryById(libraryId),
    getLibraryListById(libraryId, listId),
  ]);

  if (!library || !libraryList) {
    notFound();
  }

  const currentLibrary = library;
  const currentList = libraryList;
  const folderBreadcrumbs = currentList.parentFolderId
    ? await getLibraryFolderBreadcrumbs(currentLibrary.id, currentList.parentFolderId)
    : null;

  if (currentList.parentFolderId && !folderBreadcrumbs) {
    notFound();
  }

  const backHref = currentList.parentFolderId
    ? `/libraries/${currentLibrary.id}/folders/${currentList.parentFolderId}`
    : `/libraries/${currentLibrary.id}`;
  const canEdit = currentLibrary.ownerId === user.id;

  return (
    <div className="space-y-7">
      <nav
        aria-label="Breadcrumb"
        className="rounded-[1.5rem] border border-border bg-card/70 px-4 py-3 shadow-sm backdrop-blur"
      >
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Link href="/libraries" className="transition-colors hover:text-foreground">
              {t.navigation.libraries}
            </Link>
            <span aria-hidden="true">/</span>
          </li>
          <li className="flex items-center gap-2">
            <Link
              href={`/libraries/${currentLibrary.id}`}
              className="transition-colors hover:text-foreground"
            >
              {currentLibrary.title}
            </Link>
            <span aria-hidden="true">/</span>
          </li>
          {folderBreadcrumbs?.map((folder) => (
            <li key={folder.id} className="flex items-center gap-2">
              <Link
                href={`/libraries/${currentLibrary.id}/folders/${folder.id}`}
                className="transition-colors hover:text-foreground"
              >
                {folder.title}
              </Link>
              <span aria-hidden="true">/</span>
            </li>
          ))}
          <li>
            <span className="font-medium text-foreground">{currentList.title}</span>
          </li>
        </ol>
      </nav>

      <LibraryListDetails
        backHref={backHref}
        canEdit={canEdit}
        downloadAction={downloadLibraryListAction.bind(null, currentLibrary.id, currentList.id)}
        editAction={
          canEdit ? updateLibraryListAction.bind(null, currentLibrary.id, currentList.id) : undefined
        }
        initialEditValues={
          canEdit
            ? {
                title: currentList.title,
                description: currentList.description ?? "",
                content: formatListItemsForTextarea(currentList.items),
              }
            : undefined
        }
        libraryTitle={currentLibrary.title}
        list={currentList}
      />
    </div>
  );
}
