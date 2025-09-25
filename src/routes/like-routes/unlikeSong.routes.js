import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { unlikeSong } from '../../controllers/like-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/likes/{songId}:
 *   delete:
 *     summary: Unlike a song
 *     tags: [Likes]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 */
router.delete('/:songId', protect, unlikeSong);

export default router;
