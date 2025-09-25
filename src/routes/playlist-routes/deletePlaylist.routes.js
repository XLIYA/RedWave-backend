import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { deletePlaylist } from '../../controllers/playlist-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/playlists/{id}:
 *   delete:
 *     summary: Delete playlist (owner/admin only)
 *     tags: [Playlists]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdPath'
 *     responses:
 *       200: { description: OK }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Forbidden }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', protect, deletePlaylist);

export default router;
