import express from 'express';
import { search } from '../../controllers/search-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/search:
 *   get:
 *     summary: Search in songs/users/playlists
 *     description: Advanced search with support for standard text matching and fuzzy similarity search using PostgreSQL trigrams
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string, minLength: 1, maxLength: 200 }
 *         description: Search query (supports partial matching, special characters, and fuzzy search)
 *       - in: query
 *         name: scope
 *         schema: { type: string, enum: [songs, users, playlists], default: songs }
 *         description: Search scope - determines what type of content to search
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *     responses:
 *       200:
 *         description: Search results with pagination
 *       400:
 *         description: Bad Request - Invalid search parameters
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', search);

export default router;
