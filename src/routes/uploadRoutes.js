// src/routes/uploadRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadCover, uploadAudio, coverUpload, audioUpload } from '../controllers/uploadController.js';

const router = express.Router();

/**
 * @openapi
 * /api/upload/cover:
 *   post:
 *     summary: Upload cover image
 *     tags: [Upload]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UploadCoverRequest'
 *     responses:
 *       200: { description: OK }
 */
router.post('/cover', protect, coverUpload.single('cover'), uploadCover);

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
 *             $ref: '#/components/schemas/UploadAudioRequest'
 *     responses:
 *       200: { description: OK }
 */
router.post('/audio', protect, audioUpload.single('audio'), uploadAudio);

export default router;
