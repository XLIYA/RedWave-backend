-- DropIndex
DROP INDEX "public"."Lyrics_songId_key";

-- CreateTable
CREATE TABLE "public"."UserSongPlay" (
    "userId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "firstPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "UserSongPlay_pkey" PRIMARY KEY ("userId","songId")
);

-- CreateIndex
CREATE INDEX "UserSongPlay_songId_idx" ON "public"."UserSongPlay"("songId");

-- AddForeignKey
ALTER TABLE "public"."UserSongPlay" ADD CONSTRAINT "UserSongPlay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSongPlay" ADD CONSTRAINT "UserSongPlay_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
