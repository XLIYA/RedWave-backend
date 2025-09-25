import express from 'express';
import { listTrendingSongs } from '../../controllers/song-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/songs/trending:
 *   get:
 *     summary: Trending songs by weighted recency & playCount
 *     tags: [Songs]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - in: query
 *         name: decayDays
 *         schema: { type: integer, minimum: 1, default: 7 }
 *       - in: query
 *         name: windowDays
 *         schema: { type: integer, minimum: 1, default: 14 }
 *       - in: query
 *         name: minPlays
 *         schema: { type: integer, minimum: 0, default: 1 }
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get('/trending', listTrendingSongs);

export default router;
