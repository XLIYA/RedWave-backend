import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { updatePlaylist } from '../../controllers/playlist-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/playlists/{id}:
 *   put:
 *     summary: Update playlist (owner/admin only)
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
 *             properties:
 *               name: { type: string, minLength: 1, maxLength: 100 }
 *               description: { type: string, maxLength: 500 }
 *     responses:
 *       200: { description: OK }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Forbidden }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put('/:id', protect, updatePlaylist);

export default router;
