import express from 'express';
import { optionalAuth } from '../../middleware/authMiddleware.js';
import { listAlbums } from '../../controllers/album-controllers/index.js';

const router = express.Router();

// GET /api/albums
router.get('/', optionalAuth, listAlbums);

export default router;
