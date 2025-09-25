import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { deleteLyrics } from '../../controllers/lyrics-controllers/index.js';

const router = express.Router();

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
