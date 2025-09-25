import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { addComment } from '../../controllers/comments-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/comments/{songId}:
 *   post:
 *     summary: Add comment to a song
 *     tags: [Comments]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string }
 *     responses:
 *       201: { description: Created }
 */
router.post('/:songId', protect, addComment);

export default router;
