import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { createPlaylist } from '../../controllers/playlist-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/playlists:
 *   post:
 *     summary: Create a playlist
 *     tags: [Playlists]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 1, maxLength: 100 }
 *               description: { type: string, maxLength: 500 }
 *           example: { name: "My Favorite Songs", description: "A collection of my all-time favorite tracks" }
 *     responses:
 *       201: { description: Created }
 */
router.post('/', protect, createPlaylist);

export default router;
