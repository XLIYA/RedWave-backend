import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { uploadAlbumMulter } from '../../middleware/upload.js';
import { createAlbumWithTracks } from '../../controllers/album-controllers/index.js';

const router = express.Router();
/**
 * @openapi
 * /api/albums:
 *   post:
 *     summary: ساخت آلبوم به‌همراه ترک‌ها
 *     tags: [Albums]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cover: { type: string, format: binary, description: "تصویر کاور" }
 *               audios: 
 *                 type: array
 *                 items: { type: string, format: binary, description: "فایل‌های صوتی MP3/WAV/..." }
 *               title: { type: string }
 *               artist: { type: string }
 *               genre: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

router.post(
  '/',
  protect,
  uploadAlbumMulter.fields([
    { name: 'cover',  maxCount: 1 },
    { name: 'audios', maxCount: 100 },
  ]),
  createAlbumWithTracks
);

export default router;
