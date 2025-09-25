import express from 'express';
import uploadCoverRoutes from './uploadCover.routes.js';
import uploadAudioRoutes from './uploadAudio.routes.js';

const router = express.Router();

// ترتیب اهمیتی ندارد؛ هر دو زیر /api/upload مونت می‌شوند
router.use(uploadCoverRoutes); // POST /cover
router.use(uploadAudioRoutes); // POST /audio

export default router;
