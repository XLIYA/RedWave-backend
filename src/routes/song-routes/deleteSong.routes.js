import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { deleteSong } from '../../controllers/song-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/songs/{id}:
 *   delete:
 *     summary: Delete a song (owner/admin only)
 *     tags: [Songs]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/SongIdPath'
 *     responses:
 *       200: { description: OK }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Forbidden }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', protect, deleteSong);

export default router;
