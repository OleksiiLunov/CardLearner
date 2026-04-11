import { notFound } from "next/navigation";

import {
  createRootLibraryFolderAction,
  createRootLibraryListAction,
} from "@/app/actions/libraries";
import { CreateRootFolderForm } from "@/components/libraries/create-root-folder-form";
import { CreateRootListForm } from "@/components/libraries/create-root-list-form";
import { LibraryNavigationContent } from "@/components/libraries/library-navigation-content";
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
          <div className="grid gap-4 xl:grid-cols-2">
            <CreateRootFolderForm action={createRootLibraryFolderAction.bind(null, currentLibrary.id)} />
            <CreateRootListForm action={createRootLibraryListAction.bind(null, currentLibrary.id)} />
          </div>
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
