// src/routes/lyricsRoutes.js
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { getLyrics, upsertLyrics, deleteLyrics } from '../../controllers/lyrics-controllers/index.js';

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

/**
 * @openapi
 * /api/lyrics/{id}:
 *   delete:
 *     summary: Delete lyrics (owner/admin)
 *     tags: [Lyrics]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/SongIdPath'
 *     responses:
 *       200: { description: OK }
 */
router.delete('/:id', protect, deleteLyrics);

export default router;
