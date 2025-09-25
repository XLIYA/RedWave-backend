import express from 'express';

import listTopTagsRoutes from './listTopTags.routes.js';
import getSongTagsRoutes from './getSongTags.routes.js';
import addSongTagRoutes from './addSongTag.routes.js';
import removeSongTagRoutes from './removeSongTag.routes.js';

const router = express.Router();

// ترتیب: ریشه سپس مسیرهای song/...
router.use(listTopTagsRoutes);     // GET /
router.use(getSongTagsRoutes);     // GET /song/:id
router.use(addSongTagRoutes);      // POST /song/:id
router.use(removeSongTagRoutes);   // DELETE /song/:id

export default router;
