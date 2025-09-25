import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { updateComment } from '../../controllers/comments-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/comments/{id}:
 *   put:
 *     summary: Update my comment
 *     tags: [Comments]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
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
 *       200: { description: OK }
 */
router.put('/:id', protect, updateComment);

export default router;
