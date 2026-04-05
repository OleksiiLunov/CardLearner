import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ParsedListItemInput } from "@/lib/lists/parse-list-items";

export type CreateListWithItemsInput = {
  userId: string;
  name: string;
  items: ParsedListItemInput[];
};

export type UpdateListWithItemsInput = {
  listId: string;
  userId: string;
  name: string;
  items: ParsedListItemInput[];
};

const listInclude = {
  items: {
    orderBy: {
      position: "asc",
    },
  },
} satisfies Prisma.ListInclude;

export async function getListsByUser(userId: string) {
  return prisma.list.findMany({
    where: { userId },
    include: {
      items: {
        orderBy: {
          position: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getListByIdForUser(listId: string, userId: string) {
  return prisma.list.findFirst({
    where: {
      id: listId,
      userId,
    },
    include: listInclude,
  });
}

export async function createListWithItems(input: CreateListWithItemsInput) {
  return prisma.list.create({
    data: {
      userId: input.userId,
      name: input.name.trim(),
      items: {
        create: input.items.map((item, index) => ({
          front: item.front,
          back: item.back,
          position: item.position ?? index,
        })),
      },
    },
    include: listInclude,
  });
}

export async function updateListWithItems(input: UpdateListWithItemsInput) {
  return prisma.$transaction(async (tx) => {
    const existingList = await tx.list.findFirst({
      where: {
        id: input.listId,
        userId: input.userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingList) {
      return null;
    }

    await tx.listItem.deleteMany({
      where: {
        listId: existingList.id,
      },
    });

    return tx.list.update({
      where: {
        id: existingList.id,
      },
      data: {
        name: input.name.trim(),
        items: {
          create: input.items.map((item, index) => ({
            front: item.front,
            back: item.back,
            position: item.position ?? index,
          })),
        },
      },
      include: listInclude,
    });
  });
}

export async function deleteListForUser(listId: string, userId: string) {
  const result = await prisma.list.deleteMany({
    where: {
      id: listId,
      userId,
    },
  });

  return result.count > 0;
}
