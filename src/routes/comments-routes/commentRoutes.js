// src/routes/commentRoutes.js
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { listComments, addComment, updateComment, deleteComment } from '../../controllers/comments-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/comments/{songId}:
 *   get:
 *     summary: List comments for a song (paged)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *     responses:
 *       200: { description: OK }
 */
router.get('/:songId', listComments);

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
