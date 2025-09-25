import express from 'express';
import { searchSuggestions } from '../../controllers/search-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/search/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     description: Provides autocomplete suggestions based on existing song titles and artist names
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string, minLength: 2, maxLength: 50 }
 *         description: Partial search query (minimum 2 characters)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 20, default: 10 }
 *         description: Maximum number of suggestions to return
 *     responses:
 *       200: { description: List of search suggestions }
 *       400: { description: Bad Request - Invalid suggestion parameters }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get('/suggestions', searchSuggestions);

export default router;
