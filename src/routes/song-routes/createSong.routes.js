import express from 'express';
import { protect, requireAdmin } from '../../middleware/authMiddleware.js';
import { createSong } from '../../controllers/song-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/songs:
 *   post:
 *     summary: Create a song
 *     tags: [Songs]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, artist, genre, releaseDate, coverImage, fileUrl]
 *     responses:
 *       201: { description: Created }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/', protect, requireAdmin, createSong);

export default router;
