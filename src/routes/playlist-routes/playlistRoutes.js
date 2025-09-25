// src/routes/playlistRoutes.js
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import {
  createPlaylist,
  getPlaylist,
  getMyPlaylists,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from '../../controllers/playlist-controllers/index.js';

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
 *               name: 
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description: 
 *                 type: string
 *                 maxLength: 500
 *           example:
 *             name: "My Favorite Songs"
 *             description: "A collection of my all-time favorite tracks"
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 name: { type: string }
 *                 description: { type: string }
 *                 ownerId: { type: string }
 *                 createdAt: { type: string }
 *                 updatedAt: { type: string }
 *                 owner:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     username: { type: string }
 *                 _count:
 *                   type: object
 *                   properties:
 *                     songs: { type: integer }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/', protect, createPlaylist);

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
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       name: { type: string }
 *                       description: { type: string }
 *                       ownerId: { type: string }
 *                       createdAt: { type: string }
 *                       updatedAt: { type: string }
 *                       owner:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           username: { type: string }
 *                       _count:
 *                         type: object
 *                         properties:
 *                           songs: { type: integer }
 *                 page: { type: integer }
 *                 pageSize: { type: integer }
 *                 total: { type: integer }
 *                 pages: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me', protect, getMyPlaylists);

/**
 * @openapi
 * /api/playlists/{id}:
 *   get:
 *     summary: Get playlist by id
 *     tags: [Playlists]
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdPath'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 name: { type: string }
 *                 description: { type: string }
 *                 owner:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     username: { type: string }
 *                 createdAt: { type: string }
 *                 updatedAt: { type: string }
 *                 songsCount: { type: integer }
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       title: { type: string }
 *                       artist: { type: string }
 *                       genre: { type: string }
 *                       coverImage: { type: string }
 *                       fileUrl: { type: string }
 *                       addedAt: { type: string }
 *                       uploadedBy:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           username: { type: string }
 *                       analytics:
 *                         type: object
 *                         properties:
 *                           playCount: { type: integer }
 *                           uniqueListeners: { type: integer }
 *                           lastPlayed: { type: string }
 *                       _count:
 *                         type: object
 *                         properties:
 *                           comments: { type: integer }
 *                           likes: { type: integer }
 *                           moodTags: { type: integer }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', getPlaylist);

/**
 * @openapi
 * /api/playlists/{id}:
 *   put:
 *     summary: Update playlist (owner/admin only)
 *     tags: [Playlists]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: 
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description: 
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200: { description: OK }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Forbidden }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put('/:id', protect, updatePlaylist);

/**
 * @openapi
 * /api/playlists/{id}:
 *   delete:
 *     summary: Delete playlist (owner/admin only)
 *     tags: [Playlists]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdPath'
 *     responses:
 *       200: { description: OK }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Forbidden }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', protect, deletePlaylist);

/**
 * @openapi
 * /api/playlists/{id}/songs:
 *   post:
 *     summary: Add song to playlist
 *     tags: [Playlists]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [songId]
 *             properties:
 *               songId: 
 *                 type: string 
 *                 format: uuid
 *                 description: ID of the song to add
 *           example:
 *             songId: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean }
 *                 message: { type: string }
 *                 playlistSong:
 *                   type: object
 *                   properties:
 *                     playlistId: { type: string }
 *                     songId: { type: string }
 *                     createdAt: { type: string }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Forbidden }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post('/:id/songs', protect, addSongToPlaylist);

/**
 * @openapi
 * /api/playlists/{id}/songs/{songId}:
 *   delete:
 *     summary: Remove song from playlist
 *     tags: [Playlists]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/PlaylistIdPath'
 *       - in: path
 *         name: songId
 *         required: true
 *         schema: 
 *           type: string 
 *           format: uuid
 *         description: ID of the song to remove
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean }
 *                 message: { type: string }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Forbidden }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id/songs/:songId', protect, removeSongFromPlaylist);

export default router;