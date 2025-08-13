-- AlterTable
ALTER TABLE "public"."Song" ADD COLUMN     "searchKey" VARCHAR(256) NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "Song_searchKey_idx" ON "public"."Song"("searchKey");
