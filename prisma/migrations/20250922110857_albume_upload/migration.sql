/*
  Warnings:

  - A unique constraint covering the columns `[title,artist,albumId]` on the table `Song` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Song_title_artist_key";

-- CreateIndex
CREATE UNIQUE INDEX "Song_title_artist_albumId_key" ON "public"."Song"("title", "artist", "albumId");
