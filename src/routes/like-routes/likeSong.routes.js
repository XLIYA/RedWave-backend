import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { likeSong } from '../../controllers/like-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/likes/{songId}:
 *   post:
 *     summary: Like a song
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
router.post('/:songId', protect, likeSong);

export default router;
