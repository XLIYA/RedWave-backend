import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { addSongTag } from '../../controllers/tag-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/tags/song/{id}:
 *   post:
 *     summary: Add tag to a song
 *     tags: [Tags]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/SongIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tag]
 *             properties:
 *               tag: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.post('/song/:id', protect, addSongTag);

export default router;
