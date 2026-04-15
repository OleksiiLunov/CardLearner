import { z } from "zod";

const nonEmptyTextSchema = z.string().trim().min(1);
const slugSchema = nonEmptyTextSchema.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const librarySeedListItemSchema = z
  .object({
    front: nonEmptyTextSchema,
    back: nonEmptyTextSchema,
  })
  .strict();

export const librarySeedListSchema = z
  .object({
    title: nonEmptyTextSchema,
    slug: slugSchema,
    items: z.array(librarySeedListItemSchema).min(1),
  })
  .strict();

export const librarySeedCategorySchema = z
  .object({
    name: nonEmptyTextSchema,
    slug: slugSchema,
    lists: z.array(librarySeedListSchema).min(1),
  })
  .strict();

export const librarySeedLevelSchema = z
  .object({
    name: nonEmptyTextSchema,
    slug: slugSchema,
    categories: z.array(librarySeedCategorySchema).min(1),
  })
  .strict();

export const librarySeedSchema = z
  .object({
    name: nonEmptyTextSchema,
    slug: slugSchema,
    levels: z.array(librarySeedLevelSchema).min(1),
  })
  .strict();

export const librarySeedFileSchema = z
  .object({
    libraries: z.array(librarySeedSchema).min(1),
  })
  .strict();

export type LibrarySeedListItem = z.infer<typeof librarySeedListItemSchema>;
export type LibrarySeedList = z.infer<typeof librarySeedListSchema>;
export type LibrarySeedCategory = z.infer<typeof librarySeedCategorySchema>;
export type LibrarySeedLevel = z.infer<typeof librarySeedLevelSchema>;
export type LibrarySeed = z.infer<typeof librarySeedSchema>;
export type LibrarySeedFile = z.infer<typeof librarySeedFileSchema>;

export type LibrarySeedSummary = {
  libraryCount: number;
  folderCount: number;
  listCount: number;
  itemCount: number;
};

export function summarizeLibrarySeedFile(seedFile: LibrarySeedFile): LibrarySeedSummary {
  let folderCount = 0;
  let listCount = 0;
  let itemCount = 0;

  seedFile.libraries.forEach((library) => {
    folderCount += library.levels.length;

    library.levels.forEach((level) => {
      folderCount += level.categories.length;

      level.categories.forEach((category) => {
        listCount += category.lists.length;

        category.lists.forEach((list) => {
          itemCount += list.items.length;
        });
      });
    });
  });

  return {
    libraryCount: seedFile.libraries.length,
    folderCount,
    listCount,
    itemCount,
  };
}
