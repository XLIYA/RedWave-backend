import express from 'express';
import { listTopSongs } from '../../controllers/song-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/songs/top:
 *   get:
 *     summary: Top songs by total playCount
 *     tags: [Songs]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *       - in: query
 *         name: timeRange
 *         schema: { type: string, enum: [all, week, month, year], default: all }
 *     responses:
 *       200: { description: OK }
 */
router.get('/top', listTopSongs);

export default router;
