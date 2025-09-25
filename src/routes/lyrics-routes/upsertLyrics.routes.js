import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { upsertLyrics } from '../../controllers/lyrics-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/lyrics/{id}:
 *   put:
 *     summary: Upsert lyrics (owner/admin)
 *     tags: [Lyrics]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/SongIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lyricsText]
 *             properties:
 *               lyricsText: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.put('/:id', protect, upsertLyrics);

export default router;
