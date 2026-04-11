import { notFound } from "next/navigation";

import {
  updateLibraryAction,
  createRootLibraryFolderAction,
  createRootLibraryListAction,
} from "@/app/actions/libraries";
import { LibraryNavigationContent } from "@/components/libraries/library-navigation-content";
import { LibraryOwnerActions } from "@/components/libraries/library-owner-actions";
import { getServerLocale } from "@/i18n/get-server-locale";
import { getLibraryById, getLibraryRootContents } from "@/lib/data/libraries";
import { translations } from "@/locales";
import { requireUser } from "@/lib/supabase/session";

type LibraryDetailsPageProps = {
  params: Promise<{
    libraryId: string;
  }>;
};

export default async function LibraryDetailsPage({ params }: LibraryDetailsPageProps) {
  const [{ libraryId }, locale, user] = await Promise.all([
    params,
    getServerLocale(),
    requireUser(),
  ]);
  const t = translations[locale];
  const [library, contents] = await Promise.all([
    getLibraryById(libraryId),
    getLibraryRootContents(libraryId),
  ]);

  if (!library) {
    notFound();
  }

  const currentLibrary = library;
  const isOwner = currentLibrary.ownerId === user.id;

  return (
    <LibraryNavigationContent
      breadcrumbs={[
        { href: "/libraries", label: t.navigation.libraries },
        { label: currentLibrary.title },
      ]}
      emptyDescription={t.libraries.emptyRootContentsDescription}
      emptyTitle={t.libraries.emptyRootContentsTitle}
      folders={contents.folders}
      lists={contents.lists}
      sectionDescription={currentLibrary.description}
      sectionTitle={currentLibrary.title}
      topContent={
        isOwner ? (
          <LibraryOwnerActions
            editLibraryAction={updateLibraryAction.bind(null, currentLibrary.id)}
            initialLibraryValues={{
              title: currentLibrary.title,
              description: currentLibrary.description ?? "",
            }}
            createFolderAction={createRootLibraryFolderAction.bind(null, currentLibrary.id)}
            createListAction={createRootLibraryListAction.bind(null, currentLibrary.id)}
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
