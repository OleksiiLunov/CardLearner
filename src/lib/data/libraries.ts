import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const libraryBrowseSelect = {
  id: true,
  ownerId: true,
  title: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LibrarySelect;

const libraryFolderSummarySelect = {
  id: true,
  libraryId: true,
  parentFolderId: true,
  ownerId: true,
  title: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LibraryFolderSelect;

const libraryListSummarySelect = {
  id: true,
  libraryId: true,
  parentFolderId: true,
  ownerId: true,
  title: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LibraryListSelect;

export type LibraryBrowseItem = Prisma.LibraryGetPayload<{
  select: typeof libraryBrowseSelect;
}>;

export type LibraryFolderSummary = Prisma.LibraryFolderGetPayload<{
  select: typeof libraryFolderSummarySelect;
}>;

export type LibraryListSummary = Prisma.LibraryListGetPayload<{
  select: typeof libraryListSummarySelect;
}>;

export type LibraryRootContents = {
  folders: LibraryFolderSummary[];
  lists: LibraryListSummary[];
};

export type LibraryFolderContents = {
  folder: LibraryFolderSummary;
  childFolders: LibraryFolderSummary[];
  childLists: LibraryListSummary[];
};

export async function getLibrariesForBrowsing(): Promise<LibraryBrowseItem[]> {
  return prisma.library.findMany({
    select: libraryBrowseSelect,
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getLibrariesForOwner(ownerId: string): Promise<LibraryBrowseItem[]> {
  return prisma.library.findMany({
    where: { ownerId },
    select: libraryBrowseSelect,
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getLibraryById(libraryId: string): Promise<LibraryBrowseItem | null> {
  return prisma.library.findUnique({
    where: { id: libraryId },
    select: libraryBrowseSelect,
  });
}

export async function getLibraryRootContents(libraryId: string): Promise<LibraryRootContents> {
  const [folders, lists] = await prisma.$transaction([
    prisma.libraryFolder.findMany({
      where: {
        libraryId,
        parentFolderId: null,
      },
      select: libraryFolderSummarySelect,
      orderBy: {
        title: "asc",
      },
    }),
    prisma.libraryList.findMany({
      where: {
        libraryId,
        parentFolderId: null,
      },
      select: libraryListSummarySelect,
      orderBy: {
        title: "asc",
      },
    }),
  ]);

  return { folders, lists };
}

export async function getLibraryFolderContents(
  libraryId: string,
  folderId: string,
): Promise<LibraryFolderContents | null> {
  const folder = await prisma.libraryFolder.findFirst({
    where: {
      id: folderId,
      libraryId,
    },
    select: libraryFolderSummarySelect,
  });

  if (!folder) {
    return null;
  }

  const currentFolder = folder;
  const [childFolders, childLists] = await prisma.$transaction([
    prisma.libraryFolder.findMany({
      where: {
        libraryId,
        parentFolderId: currentFolder.id,
      },
      select: libraryFolderSummarySelect,
      orderBy: {
        title: "asc",
      },
    }),
    prisma.libraryList.findMany({
      where: {
        libraryId,
        parentFolderId: currentFolder.id,
      },
      select: libraryListSummarySelect,
      orderBy: {
        title: "asc",
      },
    }),
  ]);

  return {
    folder: currentFolder,
    childFolders,
    childLists,
  };
}
