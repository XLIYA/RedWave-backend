import express from 'express';
import { getPlaylist } from '../../controllers/playlist-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/playlists/{id}:
 *   get:
 *     summary: Get playlist by id
 *     tags: [Playlists]
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdPath'
 *     responses:
 *       200: { description: OK }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', getPlaylist);

export default router;
