import { notFound } from "next/navigation";

import {
  createNestedLibraryFolderAction,
  createNestedLibraryListAction,
  deleteLibraryFolderAction,
  updateLibraryFolderAction,
} from "@/app/actions/libraries";
import { CreateNestedFolderDialogAction } from "@/components/libraries/create-nested-folder-dialog-action";
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
  const [{ libraryId, folderId }, locale, user] = await Promise.all([
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
  const isOwner = currentLibrary.ownerId === user.id;

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
      topContent={
        isOwner ? (
          <CreateNestedFolderDialogAction
            action={createNestedLibraryFolderAction.bind(
              null,
              currentLibrary.id,
              currentFolderContents.folder.id,
            )}
            deleteActionTarget={{
              folderId: currentFolderContents.folder.id,
              folderTitle: currentFolderContents.folder.title,
              libraryId: currentLibrary.id,
            }}
            editAction={updateLibraryFolderAction.bind(
              null,
              currentLibrary.id,
              currentFolderContents.folder.id,
            )}
            initialEditValues={{
              title: currentFolderContents.folder.title,
            }}
            createListAction={createNestedLibraryListAction.bind(
              null,
              currentLibrary.id,
              currentFolderContents.folder.id,
            )}
          />
        ) : null
      }
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
