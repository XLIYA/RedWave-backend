import express from 'express';
import { protect, optionalAuth /*, requireAdmin */ } from '../../middleware/authMiddleware.js';
import { uploadAlbumMulter } from '../../middleware/upload.js';
import { createAlbumWithTracks, getAlbum, listAlbums } from '../../controllers/album-controllers/index.js';

const router = express.Router();

router.get('/__ping', (req, res) => res.json({ ok: true, route: 'albums' }));

router.get('/', optionalAuth, listAlbums);
router.get('/:id', optionalAuth, getAlbum);

router.post(
  '/',
  protect,
  uploadAlbumMulter.fields([{ name: 'cover', maxCount: 1 }, { name: 'audios', maxCount: 100 }]),
  createAlbumWithTracks
);

export default router;
