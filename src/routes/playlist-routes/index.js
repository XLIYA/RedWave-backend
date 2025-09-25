import express from 'express';

import createPlaylistRoutes from './createPlaylist.routes.js';
import myPlaylistsRoutes from './myPlaylists.routes.js';
import getPlaylistByIdRoutes from './getPlaylistById.routes.js';
import updatePlaylistRoutes from './updatePlaylist.routes.js';
import deletePlaylistRoutes from './deletePlaylist.routes.js';
import addSongToPlaylistRoutes from './addSongToPlaylist.routes.js';
import removeSongFromPlaylistRoutes from './removeSongFromPlaylist.routes.js';

const router = express.Router();

// ترتیب: عملیات روی ریشه، سپس شناسه‌ها
router.use(createPlaylistRoutes);          // POST /
router.use(myPlaylistsRoutes);             // GET /me
router.use(addSongToPlaylistRoutes);       // POST /:id/songs
router.use(removeSongFromPlaylistRoutes);  // DELETE /:id/songs/:songId
router.use(updatePlaylistRoutes);          // PUT /:id
router.use(deletePlaylistRoutes);          // DELETE /:id
router.use(getPlaylistByIdRoutes);         // GET /:id

export default router;
