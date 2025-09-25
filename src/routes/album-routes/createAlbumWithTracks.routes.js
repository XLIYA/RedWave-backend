import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { uploadAlbumMulter } from '../../middleware/upload.js';
import { createAlbumWithTracks } from '../../controllers/album-controllers/index.js';

const router = express.Router();

// POST /api/albums
router.post(
  '/',
  protect,
  uploadAlbumMulter.fields([
    { name: 'cover',  maxCount: 1 },
    { name: 'audios', maxCount: 100 },
  ]),
  createAlbumWithTracks
);

export default router;
