import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { removeSongFromPlaylist } from '../../controllers/playlist-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/playlists/{id}/songs/{songId}:
 *   delete:
 *     summary: Remove song from playlist
 *     tags: [Playlists]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdPath'
 *       - in: path
 *         name: songId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID of the song to remove
 *     responses:
 *       200: { description: OK }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Forbidden }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id/songs/:songId', protect, removeSongFromPlaylist);

export default router;
