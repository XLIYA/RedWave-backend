import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { deleteComment } from '../../controllers/comments-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete my comment
 *     tags: [Comments]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 */
router.delete('/:id', protect, deleteComment);

export default router;
