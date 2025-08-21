// src/routes/uploadRoutes.js
import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import { uploadCover, uploadAudio, uploadErrorHandler } from '../controllers/uploadController.js';

const router = express.Router();

/**
 * @openapi
 * /api/upload/cover:
 *   post:
 *     summary: Upload cover image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: Image file (.jpg, .jpeg, .png, .webp), max 10MB
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request
 */
router.post('/cover', protect, requireAdmin, ...uploadCover, uploadErrorHandler);

/**
 * @openapi
 * /api/upload/audio:
 *   post:
 *     summary: Upload audio file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
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
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request
 */
router.post('/audio', protect, requireAdmin, ...uploadAudio, uploadErrorHandler);

export default router;
