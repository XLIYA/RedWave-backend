-- This is an empty migration.
-- Enable extension (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Songs: trigram indexes
CREATE INDEX "Song_title_trgm_idx"       ON "public"."Song" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "Song_artist_trgm_idx"      ON "public"."Song" USING GIN ("artist" gin_trgm_ops);
CREATE INDEX "Song_genre_trgm_idx"       ON "public"."Song" USING GIN ("genre" gin_trgm_ops);
CREATE INDEX "Song_searchKey_trgm_idx"   ON "public"."Song" USING GIN ("searchKey" gin_trgm_ops);

-- Users: trigram on username
CREATE INDEX "User_username_trgm_idx"    ON "public"."User" USING GIN ("username" gin_trgm_ops);

-- Playlists: trigram on name & description
CREATE INDEX "Playlist_name_trgm_idx"         ON "public"."Playlist" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "Playlist_description_trgm_idx"  ON "public"."Playlist" USING GIN ("description" gin_trgm_ops);
