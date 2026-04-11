import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ParsedListItemInput } from "@/lib/lists/parse-list-items";

const libraryBrowseArgs = Prisma.validator<Prisma.LibraryDefaultArgs>()({
  select: {
    id: true,
    ownerId: true,
    title: true,
    description: true,
    createdAt: true,
    updatedAt: true,
  },
});

const libraryFolderSummaryArgs = Prisma.validator<Prisma.LibraryFolderDefaultArgs>()({
  select: {
    id: true,
    libraryId: true,
    parentFolderId: true,
    ownerId: true,
    title: true,
    createdAt: true,
    updatedAt: true,
  },
});

const libraryListSummaryArgs = Prisma.validator<Prisma.LibraryListDefaultArgs>()({
  select: {
    id: true,
    libraryId: true,
    parentFolderId: true,
    ownerId: true,
    title: true,
    description: true,
    createdAt: true,
    updatedAt: true,
  },
});

export type LibraryBrowseItem = Prisma.LibraryGetPayload<{
  select: typeof libraryBrowseArgs.select;
}>;

export type LibraryFolderSummary = Prisma.LibraryFolderGetPayload<{
  select: typeof libraryFolderSummaryArgs.select;
}>;

export type LibraryListSummary = Prisma.LibraryListGetPayload<{
  select: typeof libraryListSummaryArgs.select;
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

export type LibraryFolderBreadcrumbs = LibraryFolderSummary[];

type CreateLibraryInput = {
  ownerId: string;
  title: string;
  description: string | null;
};

type CreateRootLibraryFolderInput = {
  libraryId: string;
  ownerId: string;
  title: string;
};

type CreateRootLibraryListInput = {
  libraryId: string;
  ownerId: string;
  title: string;
  description: string | null;
  items: ParsedListItemInput[];
};

export async function getLibrariesForBrowsing(): Promise<LibraryBrowseItem[]> {
  return prisma.library.findMany({
    ...libraryBrowseArgs,
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getLibrariesForOwner(ownerId: string): Promise<LibraryBrowseItem[]> {
  return prisma.library.findMany({
    where: { ownerId },
    ...libraryBrowseArgs,
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getLibraryById(libraryId: string): Promise<LibraryBrowseItem | null> {
  return prisma.library.findUnique({
    where: { id: libraryId },
    ...libraryBrowseArgs,
  });
}

export async function createLibrary(input: CreateLibraryInput): Promise<LibraryBrowseItem> {
  return prisma.library.create({
    data: {
      ownerId: input.ownerId,
      title: input.title,
      description: input.description,
    },
    ...libraryBrowseArgs,
  });
}

export async function createRootLibraryFolder(
  input: CreateRootLibraryFolderInput,
): Promise<LibraryFolderSummary> {
  return prisma.libraryFolder.create({
    data: {
      libraryId: input.libraryId,
      parentFolderId: null,
      ownerId: input.ownerId,
      title: input.title,
    },
    ...libraryFolderSummaryArgs,
  });
}

export async function createRootLibraryList(
  input: CreateRootLibraryListInput,
): Promise<LibraryListSummary> {
  return prisma.libraryList.create({
    data: {
      libraryId: input.libraryId,
      parentFolderId: null,
      ownerId: input.ownerId,
      title: input.title,
      description: input.description,
      items: {
        create: input.items.map((item, index) => ({
          front: item.front,
          back: item.back,
          position: item.position ?? index,
        })),
      },
    },
    ...libraryListSummaryArgs,
  });
}

export async function getLibraryRootContents(libraryId: string): Promise<LibraryRootContents> {
  const [folders, lists] = await prisma.$transaction([
    prisma.libraryFolder.findMany({
      where: {
        libraryId,
        parentFolderId: null,
      },
      ...libraryFolderSummaryArgs,
      orderBy: {
        title: "asc",
      },
    }),
    prisma.libraryList.findMany({
      where: {
        libraryId,
        parentFolderId: null,
      },
      ...libraryListSummaryArgs,
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
    ...libraryFolderSummaryArgs,
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
      ...libraryFolderSummaryArgs,
      orderBy: {
        title: "asc",
      },
    }),
    prisma.libraryList.findMany({
      where: {
        libraryId,
        parentFolderId: currentFolder.id,
      },
      ...libraryListSummaryArgs,
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

export async function getLibraryFolderBreadcrumbs(
  libraryId: string,
  folderId: string,
): Promise<LibraryFolderBreadcrumbs | null> {
  const breadcrumbs: LibraryFolderSummary[] = [];
  const visitedFolderIds = new Set<string>();
  let currentFolderId: string | null = folderId;

  while (currentFolderId) {
    if (visitedFolderIds.has(currentFolderId)) {
      return null;
    }

    visitedFolderIds.add(currentFolderId);

    const folder: LibraryFolderSummary | null = await prisma.libraryFolder.findFirst({
      where: {
        id: currentFolderId,
        libraryId,
      },
      ...libraryFolderSummaryArgs,
    });

    if (!folder) {
      return null;
    }

    breadcrumbs.push(folder);
    currentFolderId = folder.parentFolderId;
  }

  breadcrumbs.reverse();

  return breadcrumbs;
}
