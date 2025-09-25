import express from 'express';
import { protect, requireAdmin } from '../../middleware/authMiddleware.js';
import { uploadAudio, uploadErrorHandler } from '../../controllers/upload-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/upload/audio:
 *   post:
 *     summary: Upload audio file
 *     tags: [Upload]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file (.mp3, .wav, .ogg, .flac, .aac, .m4a, .webm), max 100MB
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad Request }
 */
router.post('/audio', protect, requireAdmin, ...uploadAudio, uploadErrorHandler);

export default router;
