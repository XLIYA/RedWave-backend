import express from 'express';
import { getUserPlaylists } from '../../controllers/user-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/users/{id}/playlists:
 *   get:
 *     summary: List user's playlists
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200: { description: OK }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id/playlists', getUserPlaylists);

export default router;
