import express from 'express';
import getLikesRoutes from './getLikes.routes.js';
import likeSongRoutes from './likeSong.routes.js';
import unlikeSongRoutes from './unlikeSong.routes.js';

const router = express.Router();

// مسیرها یکتا هستند؛ ترتیب اهمیتی ندارد
router.use(getLikesRoutes);     // GET /:songId
router.use(likeSongRoutes);     // POST /:songId
router.use(unlikeSongRoutes);   // DELETE /:songId

export default router;
