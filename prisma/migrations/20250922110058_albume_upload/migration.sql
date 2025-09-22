/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,name]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Song" ADD COLUMN     "albumId" TEXT,
ADD COLUMN     "discNumber" INTEGER,
ADD COLUMN     "trackNumber" INTEGER;

-- CreateTable
CREATE TABLE "public"."Album" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "description" TEXT,
    "releaseDate" TIMESTAMP(3),
    "coverImage" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Album_uploadedById_idx" ON "public"."Album"("uploadedById");

-- CreateIndex
CREATE INDEX "Album_title_idx" ON "public"."Album"("title");

-- CreateIndex
CREATE INDEX "Album_artist_idx" ON "public"."Album"("artist");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_ownerId_name_key" ON "public"."Playlist"("ownerId", "name");

-- CreateIndex
CREATE INDEX "Song_albumId_trackNumber_idx" ON "public"."Song"("albumId", "trackNumber");

-- AddForeignKey
ALTER TABLE "public"."Album" ADD CONSTRAINT "Album_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Song" ADD CONSTRAINT "Song_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;
