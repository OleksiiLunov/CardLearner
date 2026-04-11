import { notFound } from "next/navigation";

import { LibraryNavigationContent } from "@/components/libraries/library-navigation-content";
import { getServerLocale } from "@/i18n/get-server-locale";
import {
  getLibraryById,
  getLibraryFolderBreadcrumbs,
  getLibraryFolderContents,
} from "@/lib/data/libraries";
import { translations } from "@/locales";
import { requireUser } from "@/lib/supabase/session";

type LibraryFolderDetailsPageProps = {
  params: Promise<{
    libraryId: string;
    folderId: string;
  }>;
};

export default async function LibraryFolderDetailsPage({
  params,
}: LibraryFolderDetailsPageProps) {
  const [{ libraryId, folderId }, locale] = await Promise.all([
    params,
    getServerLocale(),
    requireUser(),
  ]);
  const t = translations[locale];
  const [library, folderContents, breadcrumbs] = await Promise.all([
    getLibraryById(libraryId),
    getLibraryFolderContents(libraryId, folderId),
    getLibraryFolderBreadcrumbs(libraryId, folderId),
  ]);

  if (!library || !folderContents || !breadcrumbs || breadcrumbs.length === 0) {
    notFound();
  }

  const currentLibrary = library;
  const currentFolderContents = folderContents;

  return (
    <LibraryNavigationContent
      breadcrumbs={[
        { href: "/libraries", label: t.navigation.libraries },
        { href: `/libraries/${currentLibrary.id}`, label: currentLibrary.title },
        ...breadcrumbs.map((folder, index) => ({
          href:
            index === breadcrumbs.length - 1
              ? undefined
              : `/libraries/${currentLibrary.id}/folders/${folder.id}`,
          label: folder.title,
        })),
      ]}
      emptyDescription={t.libraries.emptyFolderContentsDescription}
      emptyTitle={t.libraries.emptyFolderContentsTitle}
      folders={currentFolderContents.childFolders}
      lists={currentFolderContents.childLists}
      parentTitle={currentLibrary.title}
      sectionTitle={currentFolderContents.folder.title}
      t={{
        emptyFolders: t.libraries.emptyFolders,
        emptyLists: t.libraries.emptyLists,
        foldersHeading: t.libraries.foldersHeading,
        listsHeading: t.libraries.listsHeading,
        openFolder: t.libraries.openFolder,
      }}
    />
  );
}
