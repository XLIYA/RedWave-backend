// src/routes/songRoutes.js
import express from 'express';
import { protect, optionalAuth, requireAdmin } from '../../middleware/authMiddleware.js';
import {
  createSong,
  getSong,
  listSongs,
  updateSong,
  deleteSong,
  playSong,
  listTopSongs,
  listTrendingSongs,
} from '../../controllers/song-controllers/songController.js';

const router = express.Router();

/**
 * @openapi
 * /api/songs/top:
 *   get:
 *     summary: Top songs by total playCount
 *     tags: [Songs]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *         description: Filter by genre
 *       - in: query
 *         name: timeRange
 *         schema: 
 *           type: string
 *           enum: [all, week, month, year]
 *           default: all
 *         description: Time range filter
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
 *                     $ref: '#/components/schemas/SongWithAnalytics'
 *                 page: { type: integer }
 *                 pageSize: { type: integer }
 *                 total: { type: integer }
 *                 pages: { type: integer }
 *                 filters:
 *                   type: object
 *                   properties:
 *                     genre: { type: string }
 *                     timeRange: { type: string }
 */
router.get('/top', listTopSongs);

/**
 * @openapi
 * /api/songs/trending:
 *   get:
 *     summary: Trending songs by weighted recency & playCount
 *     tags: [Songs]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - in: query
 *         name: decayDays
 *         schema: 
 *           type: integer
 *           minimum: 1
 *           default: 7
 *         description: Number of days for decay calculation
 *       - in: query
 *         name: windowDays
 *         schema: 
 *           type: integer
 *           minimum: 1
 *           default: 14
 *         description: Time window for trending calculation
 *       - in: query
 *         name: minPlays
 *         schema: 
 *           type: integer
 *           minimum: 0
 *           default: 1
 *         description: Minimum plays required
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *         description: Filter by genre
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
 *                     $ref: '#/components/schemas/SongWithAnalytics'
 *                 page: { type: integer }
 *                 pageSize: { type: integer }
 *                 total: { type: integer }
 *                 pages: { type: integer }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     decayDays: { type: integer }
 *                     windowDays: { type: integer }
 *                     minPlays: { type: integer }
 *                     genre: { type: string }
 */
router.get('/trending', listTrendingSongs);

/**
 * @openapi
 * /api/songs:
 *   get:
 *     summary: List songs (paginated, filter/sort)
 *     tags: [Songs]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *         description: Filter by genre
 *       - in: query
 *         name: artist
 *         schema: { type: string }
 *         description: Filter by artist
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [recent, popular, trending, alphabetical]
 *           default: recent
 *         description: Sort order
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
 *                     $ref: '#/components/schemas/SongWithAnalytics'
 *                 page: { type: integer }
 *                 pageSize: { type: integer }
 *                 total: { type: integer }
 *                 pages: { type: integer }
 *                 filters:
 *                   type: object
 *                   properties:
 *                     q: { type: string }
 *                     genre: { type: string }
 *                     artist: { type: string }
 *                     order: { type: string }
 */
router.get('/', listSongs);

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
 *             properties:
 *               title: 
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Song title
 *               artist: 
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Artist name
 *               genre: 
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *                 description: Music genre
 *               releaseDate: 
 *                 type: string
 *                 format: date-time
 *                 description: Release date
 *               coverImage: 
 *                 type: string
 *                 format: uri
 *                 description: Cover image URL
 *               fileUrl: 
 *                 type: string
 *                 format: uri
 *                 description: Audio file URL
 *           example:
 *             title: "SICKO MODE"
 *             artist: "Travis Scott"
 *             genre: "Hip-Hop"
 *             releaseDate: "2018-08-03T00:00:00.000Z"
 *             coverImage: "http://localhost:5000/uploads/covers/cover123.jpg"
 *             fileUrl: "http://localhost:5000/uploads/audio/audio123.mp3"
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SongWithAnalytics'
 *       400: 
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   message: "عنوان آهنگ لازم است"
 *               duplicate_song:
 *                 summary: Duplicate song
 *                 value:
 *                   message: "آهنگی با این عنوان و هنرمند قبلاً وجود دارد"
 *               invalid_date:
 *                 summary: Invalid release date
 *                 value:
 *                   message: "تاریخ انتشار نامعتبر است"
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/', protect, requireAdmin, createSong);

/**
 * @openapi
 * /api/songs/{id}:
 *   get:
 *     summary: Get a song by id
 *     tags: [Songs]
 *     parameters:
 *       - $ref: '#/components/parameters/SongIdPath'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SongWithAnalytics'
 *                 - type: object
 *                   properties:
 *                     lyrics:
 *                       type: object
 *                       properties:
 *                         songId: { type: string }
 *                         lyricsText: { type: string }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', getSong);

/**
 * @openapi
 * /api/songs/{id}:
 *   put:
 *     summary: Update a song (owner/admin only)
 *     tags: [Songs]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/SongIdPath'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: 
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               artist: 
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               genre: 
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               releaseDate: 
 *                 type: string
 *                 format: date-time
 *               coverImage: 
 *                 type: string
 *                 format: uri
 *           example:
 *             title: "SICKO MODE (Updated)"
 *             genre: "Rap"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SongWithAnalytics'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Forbidden }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put('/:id', protect, updateSong);

/**
 * @openapi
 * /api/songs/{id}:
 *   delete:
 *     summary: Delete a song (owner/admin only)
 *     tags: [Songs]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/SongIdPath'
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
 *             example:
 *               ok: true
 *               message: "آهنگ با موفقیت حذف شد"
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Forbidden }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/:id', protect, deleteSong);

/**
 * @openapi
 * /api/songs/{id}/play:
 *   post:
 *     summary: Increment play counters for a song
 *     tags: [Songs]
 *     parameters:
 *       - $ref: '#/components/parameters/SongIdPath'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 songId: { type: string }
 *                 playCount: { type: integer }
 *                 uniqueListeners: { type: integer }
 *                 lastPlayed: { type: string }
 *                 message: { type: string }
 *                 song:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     title: { type: string }
 *                     artist: { type: string }
 *             example:
 *               id: "analytics123"
 *               songId: "song123"
 *               playCount: 1501
 *               uniqueListeners: 801
 *               lastPlayed: "2025-08-13T10:30:00.000Z"
 *               message: "Play count updated successfully"
 *               song:
 *                 id: "song123"
 *                 title: "SICKO MODE"
 *                 artist: "Travis Scott"
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post('/:id/play', optionalAuth, playSong);

export default router;