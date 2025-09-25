// src/routes/tagRoutes.js
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { getSongTags, addSongTag, removeSongTag, listTopTags } from '../../controllers/tag-controllers/index.js';

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

/**
 * @openapi
 * /api/tags:
 *   get:
 *     summary: Top tags (global)
 *     tags: [Tags]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', listTopTags);

export default router;
