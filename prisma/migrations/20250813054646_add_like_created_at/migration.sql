-- AlterTable
ALTER TABLE "public"."Like" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Like_userId_createdAt_idx" ON "public"."Like"("userId", "createdAt" DESC);
