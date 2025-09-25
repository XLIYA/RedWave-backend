import express from 'express';
import { optionalAuth } from '../../middleware/authMiddleware.js';
import { playSong } from '../../controllers/song-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/songs/{id}/play:
 *   post:
 *     summary: Increment play counters for a song
 *     tags: [Songs]
 *     parameters:
 *       - $ref: '#/components/parameters/SongIdPath'
 *     responses:
 *       200: { description: OK }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post('/:id/play', optionalAuth, playSong);

export default router;
