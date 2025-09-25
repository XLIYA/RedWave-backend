import express from 'express';
import { listSongs } from '../../controllers/song-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/songs:
 *   get:
 *     summary: List songs (paginated, filter/sort)
 *     tags: [Songs]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *       - in: query
 *         name: artist
 *         schema: { type: string }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [recent, popular, trending, alphabetical], default: recent }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', listSongs);

export default router;
