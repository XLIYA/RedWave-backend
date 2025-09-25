import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { updateSong } from '../../controllers/song-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/songs/{id}:
 *   put:
 *     summary: Update a song (owner/admin only)
 *     tags: [Songs]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/SongIdPath'
 *     responses:
 *       200: { description: OK }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Forbidden }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put('/:id', protect, updateSong);

export default router;
