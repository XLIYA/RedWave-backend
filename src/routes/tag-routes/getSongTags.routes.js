import express from 'express';
import { getSongTags } from '../../controllers/tag-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/tags/song/{id}:
 *   get:
 *     summary: List tags of a song
 *     tags: [Tags]
 *     parameters:
 *       - $ref: '#/components/parameters/SongIdPath'
 *     responses:
 *       200: { description: OK }
 */
router.get('/song/:id', getSongTags);

export default router;
