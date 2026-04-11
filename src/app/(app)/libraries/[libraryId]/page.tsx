import { notFound } from "next/navigation";

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
  const [{ libraryId }, locale] = await Promise.all([params, getServerLocale(), requireUser()]);
  const t = translations[locale];
  const [library, contents] = await Promise.all([
    getLibraryById(libraryId),
    getLibraryRootContents(libraryId),
  ]);

  if (!library) {
    notFound();
  }

  const currentLibrary = library;

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
