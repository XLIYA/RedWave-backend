-- This is an empty migration.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS song_searchkey_trgm_idx
ON "Song" USING GIN ("searchKey" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS playlist_name_trgm_idx
ON "Playlist" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS playlist_desc_trgm_idx
ON "Playlist" USING GIN ("description" gin_trgm_ops);
