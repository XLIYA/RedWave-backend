import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { addSongToPlaylist } from '../../controllers/playlist-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/playlists/{id}/songs:
 *   post:
 *     summary: Add song to playlist
 *     tags: [Playlists]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [songId]
 *             properties:
 *               songId: { type: string, format: uuid, description: ID of the song to add }
 *           example: { songId: "123e4567-e89b-12d3-a456-426614174000" }
 *     responses:
 *       200: { description: OK }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Forbidden }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post('/:id/songs', protect, addSongToPlaylist);

export default router;
