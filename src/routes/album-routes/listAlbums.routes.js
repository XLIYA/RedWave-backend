import express from 'express';
import { optionalAuth } from '../../middleware/authMiddleware.js';
import { listAlbums } from '../../controllers/album-controllers/index.js';

const router = express.Router();
/**
 * @openapi
 * /api/albums:
 *   get:
 *     summary: لیست آلبوم‌ها
 *     tags: [Albums]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *     responses:
 *       200: { description: OK }
 */

router.get('/', optionalAuth, listAlbums);

export default router;
