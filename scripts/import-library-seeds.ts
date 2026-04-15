import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const preferredSeedPath = path.join(projectRoot, "data", "library-seeds", "test-seed.json");
const fallbackSeedPath = path.join(projectRoot, "src", "data", "library-seeds", "test-seed.json");
const schemaModulePath = path.join(projectRoot, "src", "lib", "library-seeds", "schema.ts");
const prismaModulePath = path.join(projectRoot, "src", "lib", "prisma.ts");

type LibrarySeedModule = typeof import("../src/lib/library-seeds/schema");
type LibrarySeedFile = import("../src/lib/library-seeds/schema").LibrarySeedFile;
type PrismaModule = typeof import("../src/lib/prisma");
type TransactionClient = Prisma.TransactionClient;
type DbClient = PrismaClient | TransactionClient;

type CliOptions = {
  ownerId: string | null;
  write: boolean;
};

type ImportStats = {
  createdFolders: number;
  createdLibraries: number;
  createdLists: number;
  replacedItemsCount: number;
  reusedFolders: number;
  reusedLibraries: number;
  reusedLists: number;
};

type LibraryRecord = {
  id: string;
  ownerId: string;
  slug: string | null;
  title: string;
};

type FolderRecord = {
  id: string;
  ownerId: string;
  parentFolderId: string | null;
  path: string | null;
  slug: string | null;
  title: string;
};

type ListRecord = {
  id: string;
  parentFolderId: string | null;
  path: string | null;
  slug: string | null;
  title: string;
};

const ownerIdSchema = z.string().uuid();

async function resolveSeedPath(): Promise<string> {
  const candidatePaths = [preferredSeedPath, fallbackSeedPath];

  for (const candidatePath of candidatePaths) {
    try {
      await access(candidatePath);
      return candidatePath;
    } catch {
      continue;
    }
  }

  throw new Error(
    `Seed file was not found. Checked: ${candidatePaths
      .map((candidatePath) => path.relative(projectRoot, candidatePath))
      .join(", ")}`,
  );
}

async function loadSchemaModule(): Promise<LibrarySeedModule> {
  return import(pathToFileURL(schemaModulePath).href) as Promise<LibrarySeedModule>;
}

async function loadPrismaModule(): Promise<PrismaModule> {
  return import(pathToFileURL(prismaModulePath).href) as Promise<PrismaModule>;
}

function prepareWriteDatabaseUrl(): void {
  const directUrl = process.env.DIRECT_URL;

  if (typeof directUrl !== "string" || directUrl.length === 0) {
    throw new Error("Write mode requires DIRECT_URL to be configured.");
  }

  process.env.DATABASE_URL = directUrl;
}

function parseCliOptions(argv: string[]): CliOptions {
  let ownerId: string | null = null;
  let write = false;

  argv.forEach((argument) => {
    if (argument === "--write") {
      write = true;
      return;
    }

    if (argument.startsWith("--owner-id=")) {
      ownerId = argument.slice("--owner-id=".length);
      return;
    }

    throw new Error(`Unknown argument: ${argument}`);
  });

  if (write) {
    const ownerIdResult = ownerIdSchema.safeParse(ownerId);

    if (!ownerIdResult.success) {
      throw new Error("Write mode requires --owner-id=<uuid>.");
    }

    ownerId = ownerIdResult.data;
  }

  return {
    ownerId,
    write,
  };
}

function formatHierarchy(seedFile: LibrarySeedFile): string[] {
  const lines: string[] = [];

  seedFile.libraries.forEach((library) => {
    lines.push(`- Library: ${library.name} (${library.slug})`);

    library.levels.forEach((level) => {
      lines.push(`  - Level: ${level.name} (${level.slug})`);

      level.categories.forEach((category) => {
        lines.push(`    - Category: ${category.name} (${category.slug})`);

        category.lists.forEach((list) => {
          lines.push(`      - List: ${list.title} (${list.slug}) [${list.items.length} items]`);

          list.items.forEach((item, index) => {
            lines.push(`        ${index + 1}. ${item.front} -> ${item.back}`);
          });
        });
      });
    });
  });

  return lines;
}

function buildFolderPath(parentPath: string | null, slug: string): string {
  if (parentPath === null) {
    return slug;
  }

  return `${parentPath}/${slug}`;
}

function buildListPath(folderPath: string, slug: string): string {
  return `${folderPath}/${slug}`;
}

function createEmptyImportStats(): ImportStats {
  return {
    createdFolders: 0,
    createdLibraries: 0,
    createdLists: 0,
    replacedItemsCount: 0,
    reusedFolders: 0,
    reusedLibraries: 0,
    reusedLists: 0,
  };
}

function printImportStats(stats: ImportStats): void {
  console.log("Import Summary");
  console.log(`- Created libraries: ${stats.createdLibraries}`);
  console.log(`- Reused libraries: ${stats.reusedLibraries}`);
  console.log(`- Created folders: ${stats.createdFolders}`);
  console.log(`- Reused folders: ${stats.reusedFolders}`);
  console.log(`- Created lists: ${stats.createdLists}`);
  console.log(`- Reused lists: ${stats.reusedLists}`);
  console.log(`- Replaced items count: ${stats.replacedItemsCount}`);
}

async function findLibraryBySlug(db: DbClient, slug: string): Promise<LibraryRecord | null> {
  return db.library.findUnique({
    where: { slug },
    select: {
      id: true,
      ownerId: true,
      slug: true,
      title: true,
    },
  });
}

async function findFolderByPath(
  db: DbClient,
  libraryId: string,
  folderPath: string,
): Promise<FolderRecord | null> {
  return db.libraryFolder.findFirst({
    where: {
      libraryId,
      path: folderPath,
    },
    select: {
      id: true,
      ownerId: true,
      parentFolderId: true,
      path: true,
      slug: true,
      title: true,
    },
  });
}

async function findListByPath(
  db: DbClient,
  libraryId: string,
  listPath: string,
): Promise<ListRecord | null> {
  return db.libraryList.findFirst({
    where: {
      libraryId,
      path: listPath,
    },
    select: {
      id: true,
      parentFolderId: true,
      path: true,
      slug: true,
      title: true,
    },
  });
}

async function findOrCreateLibrary(
  db: DbClient,
  stats: ImportStats,
  ownerId: string,
  librarySeed: LibrarySeedFile["libraries"][number],
): Promise<LibraryRecord> {
  const existingLibrary = await findLibraryBySlug(db, librarySeed.slug);

  if (existingLibrary !== null) {
    stats.reusedLibraries += 1;

    if (existingLibrary.title !== librarySeed.name) {
      return db.library.update({
        where: { id: existingLibrary.id },
        data: { title: librarySeed.name },
        select: {
          id: true,
          ownerId: true,
          slug: true,
          title: true,
        },
      });
    }

    return existingLibrary;
  }

  stats.createdLibraries += 1;

  return db.library.create({
    data: {
      ownerId,
      title: librarySeed.name,
      slug: librarySeed.slug,
      description: null,
    },
    select: {
      id: true,
      ownerId: true,
      slug: true,
      title: true,
    },
  });
}

async function findOrCreateFolder(
  db: DbClient,
  stats: ImportStats,
  input: {
    libraryId: string;
    ownerId: string;
    parentFolderId: string | null;
    parentPath: string | null;
    slug: string;
    title: string;
  },
): Promise<FolderRecord> {
  const folderPath = buildFolderPath(input.parentPath, input.slug);
  const existingFolder = await findFolderByPath(db, input.libraryId, folderPath);

  if (existingFolder !== null) {
    stats.reusedFolders += 1;

    if (
      existingFolder.title !== input.title ||
      existingFolder.parentFolderId !== input.parentFolderId ||
      existingFolder.slug !== input.slug
    ) {
      return db.libraryFolder.update({
        where: { id: existingFolder.id },
        data: {
          parentFolderId: input.parentFolderId,
          slug: input.slug,
          path: folderPath,
          title: input.title,
        },
        select: {
          id: true,
          ownerId: true,
          parentFolderId: true,
          path: true,
          slug: true,
          title: true,
        },
      });
    }

    return existingFolder;
  }

  stats.createdFolders += 1;

  return db.libraryFolder.create({
    data: {
      libraryId: input.libraryId,
      ownerId: input.ownerId,
      parentFolderId: input.parentFolderId,
      slug: input.slug,
      path: folderPath,
      title: input.title,
    },
    select: {
      id: true,
      ownerId: true,
      parentFolderId: true,
      path: true,
      slug: true,
      title: true,
    },
  });
}

async function replaceListItems(
  tx: TransactionClient,
  libraryListId: string,
  items: LibrarySeedFile["libraries"][number]["levels"][number]["categories"][number]["lists"][number]["items"],
): Promise<number> {
  const deletedItems = await tx.libraryListItem.deleteMany({
    where: {
      libraryListId,
    },
  });

  if (items.length > 0) {
    await tx.libraryListItem.createMany({
      data: items.map((item, index) => ({
        libraryListId,
        front: item.front,
        back: item.back,
        position: index,
      })),
    });
  }

  return deletedItems.count;
}

async function findOrCreateList(
  tx: TransactionClient,
  stats: ImportStats,
  input: {
    folderId: string;
    folderPath: string;
    libraryId: string;
    ownerId: string;
    slug: string;
    title: string;
    items: LibrarySeedFile["libraries"][number]["levels"][number]["categories"][number]["lists"][number]["items"];
  },
): Promise<void> {
  const listPath = buildListPath(input.folderPath, input.slug);
  const existingList = await findListByPath(tx, input.libraryId, listPath);

  if (existingList !== null) {
    stats.reusedLists += 1;

    const updatedList = await tx.libraryList.update({
      where: { id: existingList.id },
      data: {
        parentFolderId: input.folderId,
        slug: input.slug,
        path: listPath,
        title: input.title,
        description: null,
      },
      select: {
        id: true,
      },
    });

    stats.replacedItemsCount += await replaceListItems(tx, updatedList.id, input.items);
    return;
  }

  stats.createdLists += 1;

  await tx.libraryList.create({
    data: {
      libraryId: input.libraryId,
      ownerId: input.ownerId,
      parentFolderId: input.folderId,
      slug: input.slug,
      path: listPath,
      title: input.title,
      description: null,
      items: {
        create: input.items.map((item, index) => ({
          front: item.front,
          back: item.back,
          position: index,
        })),
      },
    },
    select: {
      id: true,
    },
  });
}

async function syncLibraryList(
  prisma: PrismaClient,
  stats: ImportStats,
  input: {
    folderId: string;
    folderPath: string;
    libraryId: string;
    ownerId: string;
    slug: string;
    title: string;
    items: LibrarySeedFile["libraries"][number]["levels"][number]["categories"][number]["lists"][number]["items"];
  },
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await findOrCreateList(tx, stats, input);
  });
}

async function runImport(seedFile: LibrarySeedFile, ownerId: string): Promise<ImportStats> {
  prepareWriteDatabaseUrl();
  const { prisma } = await loadPrismaModule();
  const stats = createEmptyImportStats();

  try {
    for (const library of seedFile.libraries) {
      const libraryRecord = await findOrCreateLibrary(prisma, stats, ownerId, library);

      for (const level of library.levels) {
        const levelFolder = await findOrCreateFolder(prisma, stats, {
          libraryId: libraryRecord.id,
          ownerId: libraryRecord.ownerId,
          parentFolderId: null,
          parentPath: null,
          slug: level.slug,
          title: level.name,
        });

        if (levelFolder.path === null) {
          throw new Error(`Imported level folder is missing path for slug ${level.slug}.`);
        }

        for (const category of level.categories) {
          const categoryFolder = await findOrCreateFolder(prisma, stats, {
            libraryId: libraryRecord.id,
            ownerId: libraryRecord.ownerId,
            parentFolderId: levelFolder.id,
            parentPath: levelFolder.path,
            slug: category.slug,
            title: category.name,
          });

          if (categoryFolder.path === null) {
            throw new Error(`Imported category folder is missing path for slug ${category.slug}.`);
          }

          for (const list of category.lists) {
            await syncLibraryList(prisma, stats, {
              folderId: categoryFolder.id,
              folderPath: categoryFolder.path,
              libraryId: libraryRecord.id,
              ownerId: libraryRecord.ownerId,
              slug: list.slug,
              title: list.title,
              items: list.items,
            });
          }
        }
      }
    }

    return stats;
  } finally {
    await prisma.$disconnect();
  }
}

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const { librarySeedFileSchema, summarizeLibrarySeedFile } = await loadSchemaModule();
  const seedPath = await resolveSeedPath();
  const fileContents = await readFile(seedPath, "utf8");

  let rawData: unknown;

  try {
    rawData = JSON.parse(fileContents) as unknown;
  } catch (error) {
    throw new Error(
      `Failed to parse JSON from ${path.relative(projectRoot, seedPath)}: ${
        error instanceof Error ? error.message : "Unknown JSON parse error"
      }`,
    );
  }

  const validationResult = librarySeedFileSchema.safeParse(rawData);

  if (!validationResult.success) {
    console.error("Library seed import failed validation.");
    console.error(`Source: ${path.relative(projectRoot, seedPath)}`);

    validationResult.error.issues.forEach((issue) => {
      const issuePath = issue.path.length > 0 ? issue.path.join(".") : "<root>";
      console.error(`- ${issuePath}: ${issue.message}`);
    });

    process.exitCode = 1;
    return;
  }

  const seedFile = validationResult.data;
  const summary = summarizeLibrarySeedFile(seedFile);
  const modeLabel = options.write ? "WRITE ENABLED" : "DRY RUN ONLY";

  console.log("Library Seed Import");
  console.log("===================");
  console.log(`Mode: ${modeLabel}`);
  console.log(`Database writes: ${options.write ? "enabled via --write" : "none"}`);
  console.log(`Source: ${path.relative(projectRoot, seedPath)}`);
  console.log("");
  console.log("Counts");
  console.log(`- Libraries: ${summary.libraryCount}`);
  console.log(`- Folders: ${summary.folderCount}`);
  console.log(`- Lists: ${summary.listCount}`);
  console.log(`- Items: ${summary.itemCount}`);
  console.log("");
  console.log("Folder count includes both level and category nodes.");
  console.log("");
  console.log("Hierarchy");

  formatHierarchy(seedFile).forEach((line) => {
    console.log(line);
  });

  console.log("");

  if (!options.write || options.ownerId === null) {
    console.log("Dry run complete. No database writes were performed.");
    console.log("To run the real import, pass --write and --owner-id=<uuid>.");
    return;
  }

  const importStats = await runImport(seedFile, options.ownerId);
  printImportStats(importStats);
  console.log("");
  console.log("Import complete.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Library seed import failed: ${message}`);
  process.exitCode = 1;
});
