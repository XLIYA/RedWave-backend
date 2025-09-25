import express from 'express';

import ping from './ping.routes.js';
import listAlbums from './listAlbums.routes.js';
import getAlbum from './getAlbum.routes.js';
import createAlbumWithTracks from './createAlbumWithTracks.routes.js';

const router = express.Router();

// ترتیب مهم است؛ ابتدا مسیرهای خاص، سپس عمومی
router.use(ping);                 // /__ping
router.use(createAlbumWithTracks); // POST /
router.use(listAlbums);            // GET /
router.use(getAlbum);              // GET /:id

export default router;
