import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { removeSongTag } from '../../controllers/tag-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/tags/song/{id}:
 *   delete:
 *     summary: Remove my tag from a song
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
router.delete('/song/:id', protect, removeSongTag);

export default router;
