-- CreateTable
CREATE TABLE "Library" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ownerId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryFolder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "libraryId" UUID NOT NULL,
    "parentFolderId" UUID,
    "ownerId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryList" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "libraryId" UUID NOT NULL,
    "parentFolderId" UUID,
    "ownerId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryListItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "libraryListId" UUID NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Library_ownerId_idx" ON "Library"("ownerId");

-- CreateIndex
CREATE INDEX "Library_title_idx" ON "Library"("title");

-- CreateIndex
CREATE INDEX "LibraryFolder_libraryId_parentFolderId_idx" ON "LibraryFolder"("libraryId", "parentFolderId");

-- CreateIndex
CREATE INDEX "LibraryFolder_title_idx" ON "LibraryFolder"("title");

-- CreateIndex
CREATE INDEX "LibraryList_libraryId_parentFolderId_idx" ON "LibraryList"("libraryId", "parentFolderId");

-- CreateIndex
CREATE INDEX "LibraryList_title_idx" ON "LibraryList"("title");

-- CreateIndex
CREATE INDEX "LibraryListItem_libraryListId_position_idx" ON "LibraryListItem"("libraryListId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryListItem_libraryListId_position_key" ON "LibraryListItem"("libraryListId", "position");

-- AddForeignKey
ALTER TABLE "LibraryFolder" ADD CONSTRAINT "LibraryFolder_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryFolder" ADD CONSTRAINT "LibraryFolder_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "LibraryFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryList" ADD CONSTRAINT "LibraryList_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryList" ADD CONSTRAINT "LibraryList_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "LibraryFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryListItem" ADD CONSTRAINT "LibraryListItem_libraryListId_fkey" FOREIGN KEY ("libraryListId") REFERENCES "LibraryList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
