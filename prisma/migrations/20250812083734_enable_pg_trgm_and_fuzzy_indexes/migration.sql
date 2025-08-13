-- DropIndex
DROP INDEX "public"."Playlist_description_trgm_idx";

-- DropIndex
DROP INDEX "public"."Playlist_name_trgm_idx";

-- DropIndex
DROP INDEX "public"."Song_artist_trgm_idx";

-- DropIndex
DROP INDEX "public"."Song_genre_trgm_idx";

-- DropIndex
DROP INDEX "public"."Song_searchKey_trgm_idx";

-- DropIndex
DROP INDEX "public"."Song_title_trgm_idx";

-- DropIndex
DROP INDEX "public"."User_username_trgm_idx";

-- Enable trigram extension once (safe if already exists)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fuzzy index for songs on normalized searchKey
CREATE INDEX IF NOT EXISTS "Song_searchKey_trgm_idx"
ON "public"."Song"
USING GIN ("searchKey" gin_trgm_ops);

-- (اختیاری ولی پیشنهادی) فازی برای یوزرنیم
CREATE INDEX IF NOT EXISTS "User_username_trgm_idx"
ON "public"."User"
USING GIN ("username" gin_trgm_ops);

-- (اختیاری) فازی برای نام/توضیح پلی‌لیست
CREATE INDEX IF NOT EXISTS "Playlist_name_trgm_idx"
ON "public"."Playlist"
USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Playlist_desc_trgm_idx"
ON "public"."Playlist"
USING GIN ("description" gin_trgm_ops);
