ALTER TABLE "Library"
ADD COLUMN "slug" TEXT;

ALTER TABLE "LibraryFolder"
ADD COLUMN "slug" TEXT,
ADD COLUMN "path" TEXT;

ALTER TABLE "LibraryList"
ADD COLUMN "slug" TEXT,
ADD COLUMN "path" TEXT;

CREATE UNIQUE INDEX "Library_slug_key" ON "Library"("slug");
CREATE UNIQUE INDEX "LibraryFolder_libraryId_path_key" ON "LibraryFolder"("libraryId", "path");
CREATE UNIQUE INDEX "LibraryList_libraryId_path_key" ON "LibraryList"("libraryId", "path");
