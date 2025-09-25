// src/routes/likeRoutes.js
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { getLikes, likeSong, unlikeSong } from '../../controllers/like-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/likes/{songId}:
 *   get:
 *     summary: List likes of a song
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 */
router.get('/:songId', getLikes);

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
