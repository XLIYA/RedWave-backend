import express from 'express';
import { listComments } from '../../controllers/comments-controllers/index.js';

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

export default router;
