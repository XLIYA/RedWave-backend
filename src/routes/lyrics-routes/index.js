import express from 'express';
import getLyricsRoutes from './getLyrics.routes.js';
import upsertLyricsRoutes from './upsertLyrics.routes.js';
import deleteLyricsRoutes from './deleteLyrics.routes.js';

const router = express.Router();

router.use(getLyricsRoutes);     // GET /:id
router.use(upsertLyricsRoutes);  // PUT /:id
router.use(deleteLyricsRoutes);  // DELETE /:id

export default router;
