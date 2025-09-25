import express from 'express';
import { protect, requireAdmin } from '../../middleware/authMiddleware.js';
import { uploadCover, uploadErrorHandler } from '../../controllers/upload-controllers/index.js';

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
 *             type: object
 *             properties:
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: Image file (.jpg, .jpeg, .png, .webp), max 10MB
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad Request }
 */
router.post('/cover', protect, requireAdmin, ...uploadCover, uploadErrorHandler);

export default router;
