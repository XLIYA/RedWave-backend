-- This is an empty migration.
-- Enable pg_trgm (once per DB)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- SONGS: fuzzy on searchKey (GIN + trgm)
CREATE INDEX IF NOT EXISTS "Song_searchKey_trgm_idx"
ON "public"."Song" USING GIN ("searchKey" gin_trgm_ops);

-- USERS: fuzzy on username
CREATE INDEX IF NOT EXISTS "User_username_trgm_idx"
ON "public"."User" USING GIN ("username" gin_trgm_ops);

-- PLAYLISTS: fuzzy on name / description
CREATE INDEX IF NOT EXISTS "Playlist_name_trgm_idx"
ON "public"."Playlist" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Playlist_description_trgm_idx"
ON "public"."Playlist" USING GIN ("description" gin_trgm_ops);
