/*
  Warnings:

  - The primary key for the `Lyrics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Lyrics` table. All the data in the column will be lost.
  - The primary key for the `MoodTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MoodTag` table. All the data in the column will be lost.
  - You are about to drop the column `moodTag` on the `MoodTag` table. All the data in the column will be lost.
  - You are about to drop the `PlaylistSongs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[title,artist]` on the table `Song` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tag` to the `MoodTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MoodTag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."PlaylistSongs" DROP CONSTRAINT "PlaylistSongs_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlaylistSongs" DROP CONSTRAINT "PlaylistSongs_songId_fkey";

-- DropIndex
DROP INDEX "public"."Comment_songId_createdAt_idx";

-- DropIndex
DROP INDEX "public"."Follow_followingId_idx";

-- DropIndex
DROP INDEX "public"."Like_songId_idx";

-- DropIndex
DROP INDEX "public"."Like_userId_createdAt_idx";

-- DropIndex
DROP INDEX "public"."MoodTag_moodTag_idx";

-- DropIndex
DROP INDEX "public"."MoodTag_songId_moodTag_key";

-- DropIndex
DROP INDEX "public"."Song_title_artist_releaseDate_key";

-- AlterTable
ALTER TABLE "public"."Analytics" ALTER COLUMN "playCount" SET DEFAULT 0,
ALTER COLUMN "uniqueListeners" SET DEFAULT 0,
ALTER COLUMN "lastPlayed" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Follow" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Lyrics" DROP CONSTRAINT "Lyrics_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Lyrics_pkey" PRIMARY KEY ("songId");

-- AlterTable
ALTER TABLE "public"."MoodTag" DROP CONSTRAINT "MoodTag_pkey",
DROP COLUMN "id",
DROP COLUMN "moodTag",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tag" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "MoodTag_pkey" PRIMARY KEY ("userId", "songId", "tag");

-- DropTable
DROP TABLE "public"."PlaylistSongs";

-- CreateTable
CREATE TABLE "public"."PlaylistSong" (
    "playlistId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistSong_pkey" PRIMARY KEY ("playlistId","songId")
);

-- CreateIndex
CREATE INDEX "Comment_songId_idx" ON "public"."Comment"("songId");

-- CreateIndex
CREATE UNIQUE INDEX "Song_title_artist_key" ON "public"."Song"("title", "artist");

-- AddForeignKey
ALTER TABLE "public"."PlaylistSong" ADD CONSTRAINT "PlaylistSong_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "public"."Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlaylistSong" ADD CONSTRAINT "PlaylistSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MoodTag" ADD CONSTRAINT "MoodTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
