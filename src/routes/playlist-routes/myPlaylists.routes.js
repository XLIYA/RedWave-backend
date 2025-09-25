import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { getMyPlaylists } from '../../controllers/playlist-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/playlists/me:
 *   get:
 *     summary: List my playlists
 *     tags: [Playlists]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *     responses:
 *       200: { description: OK }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me', protect, getMyPlaylists);

export default router;
