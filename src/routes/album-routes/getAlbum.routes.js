import express from 'express';
import { optionalAuth } from '../../middleware/authMiddleware.js';
import { getAlbum } from '../../controllers/album-controllers/index.js';

const router = express.Router();

// GET /api/albums/:id
router.get('/:id', optionalAuth, getAlbum);

export default router;
