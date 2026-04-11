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

const libraryListDetailsArgs = Prisma.validator<Prisma.LibraryListDefaultArgs>()({
  select: {
    id: true,
    libraryId: true,
    parentFolderId: true,
    ownerId: true,
    title: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    items: {
      select: {
        id: true,
        front: true,
        back: true,
        position: true,
      },
      orderBy: {
        position: "asc",
      },
    },
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

export type LibraryListDetails = Prisma.LibraryListGetPayload<{
  select: typeof libraryListDetailsArgs.select;
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

type UpdateLibraryInput = {
  libraryId: string;
  title: string;
  description: string | null;
};

type CreateRootLibraryFolderInput = {
  libraryId: string;
  ownerId: string;
  title: string;
};

type CreateNestedLibraryFolderInput = {
  libraryId: string;
  parentFolderId: string;
  ownerId: string;
  title: string;
};

type UpdateLibraryFolderInput = {
  libraryId: string;
  folderId: string;
  title: string;
};

type CreateRootLibraryListInput = {
  libraryId: string;
  ownerId: string;
  title: string;
  description: string | null;
  items: ParsedListItemInput[];
};

type CreateNestedLibraryListInput = {
  libraryId: string;
  parentFolderId: string;
  ownerId: string;
  title: string;
  description: string | null;
  items: ParsedListItemInput[];
};

type UpdateLibraryListInput = {
  libraryId: string;
  libraryListId: string;
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

export async function getLibraryFolderById(
  libraryId: string,
  folderId: string,
): Promise<LibraryFolderSummary | null> {
  return prisma.libraryFolder.findFirst({
    where: {
      id: folderId,
      libraryId,
    },
    ...libraryFolderSummaryArgs,
  });
}

export async function getLibraryListById(
  libraryId: string,
  listId: string,
): Promise<LibraryListDetails | null> {
  return prisma.libraryList.findFirst({
    where: {
      id: listId,
      libraryId,
    },
    ...libraryListDetailsArgs,
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

export async function updateLibrary(input: UpdateLibraryInput): Promise<LibraryBrowseItem> {
  return prisma.library.update({
    where: {
      id: input.libraryId,
    },
    data: {
      title: input.title,
      description: input.description,
    },
    ...libraryBrowseArgs,
  });
}

export async function deleteLibrary(libraryId: string): Promise<LibraryBrowseItem> {
  return prisma.library.delete({
    where: {
      id: libraryId,
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

export async function createNestedLibraryFolder(
  input: CreateNestedLibraryFolderInput,
): Promise<LibraryFolderSummary> {
  return prisma.libraryFolder.create({
    data: {
      libraryId: input.libraryId,
      parentFolderId: input.parentFolderId,
      ownerId: input.ownerId,
      title: input.title,
    },
    ...libraryFolderSummaryArgs,
  });
}

export async function updateLibraryFolder(
  input: UpdateLibraryFolderInput,
): Promise<LibraryFolderSummary | null> {
  const existingFolder = await getLibraryFolderById(input.libraryId, input.folderId);

  if (!existingFolder) {
    return null;
  }

  return prisma.libraryFolder.update({
    where: {
      id: existingFolder.id,
    },
    data: {
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

export async function createNestedLibraryList(
  input: CreateNestedLibraryListInput,
): Promise<LibraryListSummary> {
  return prisma.libraryList.create({
    data: {
      libraryId: input.libraryId,
      parentFolderId: input.parentFolderId,
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

export async function updateLibraryListWithItems(
  input: UpdateLibraryListInput,
): Promise<LibraryListSummary | null> {
  const existingList = await prisma.libraryList.findFirst({
    where: {
      id: input.libraryListId,
      libraryId: input.libraryId,
    },
    select: {
      id: true,
    },
  });

  if (!existingList) {
    return null;
  }

  const currentList = existingList;
  const [updatedList] = await prisma.$transaction([
    prisma.libraryList.update({
      where: {
        id: currentList.id,
      },
      data: {
        title: input.title,
        description: input.description,
      },
      ...libraryListSummaryArgs,
    }),
    prisma.libraryListItem.deleteMany({
      where: {
        libraryListId: currentList.id,
      },
    }),
    prisma.libraryListItem.createMany({
      data: input.items.map((item, index) => ({
        libraryListId: currentList.id,
        front: item.front,
        back: item.back,
        position: item.position ?? index,
      })),
    }),
  ]);

  return updatedList;
}

export async function createPrivateListFromLibraryList(
  libraryId: string,
  listId: string,
  userId: string,
): Promise<{ id: string } | null> {
  const libraryList = await getLibraryListById(libraryId, listId);

  if (!libraryList) {
    return null;
  }

  return prisma.list.create({
    data: {
      userId,
      name: libraryList.title,
      items: {
        create: libraryList.items.map((item, index) => ({
          front: item.front,
          back: item.back,
          position: item.position ?? index,
        })),
      },
    },
    select: {
      id: true,
    },
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
  const folder = await getLibraryFolderById(libraryId, folderId);

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
