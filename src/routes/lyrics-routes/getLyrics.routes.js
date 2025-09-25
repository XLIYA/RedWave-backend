import express from 'express';
import { getLyrics } from '../../controllers/lyrics-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/lyrics/{id}:
 *   get:
 *     summary: Get lyrics by songId
 *     tags: [Lyrics]
 *     parameters:
 *       - $ref: '#/components/parameters/SongIdPath'
 *     responses:
 *       200: { description: OK }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', getLyrics);

export default router;
