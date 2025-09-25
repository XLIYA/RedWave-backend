import express from 'express';
import { getLikes } from '../../controllers/like-controllers/index.js';

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

export default router;
