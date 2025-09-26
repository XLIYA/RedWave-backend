import express from 'express';
import { optionalAuth } from '../../middleware/authMiddleware.js';
import { getAlbum } from '../../controllers/album-controllers/index.js';

const router = express.Router();
/**
 * @openapi
 * /api/albums/{id}:
 *   get:
 *     summary: دریافت جزئیات آلبوم
 *     tags: [Albums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

router.get('/:id', optionalAuth, getAlbum);

export default router;
