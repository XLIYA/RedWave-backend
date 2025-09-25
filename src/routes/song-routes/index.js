import express from 'express';

import listTopSongsRoutes from './listTopSongs.routes.js';
import listTrendingSongsRoutes from './listTrendingSongs.routes.js';
import listSongsRoutes from './listSongs.routes.js';
import createSongRoutes from './createSong.routes.js';
import playSongRoutes from './playSong.routes.js';
import updateSongRoutes from './updateSong.routes.js';
import deleteSongRoutes from './deleteSong.routes.js';
import getSongRoutes from './getSong.routes.js';

const router = express.Router();

// ترتیب: مسیرهای ایستا/خاص، سپس عمومی/شناسه‌دار
router.use(listTopSongsRoutes);       // GET /top
router.use(listTrendingSongsRoutes);  // GET /trending
router.use(createSongRoutes);         // POST /
router.use(listSongsRoutes);          // GET /
router.use(playSongRoutes);           // POST /:id/play
router.use(updateSongRoutes);         // PUT /:id
router.use(deleteSongRoutes);         // DELETE /:id
router.use(getSongRoutes);            // GET /:id

export default router;
