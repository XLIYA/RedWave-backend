import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { getMyUploads } from '../../controllers/user-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/users/me/uploads:
 *   get:
 *     summary: List my uploaded songs
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me/uploads', protect, getMyUploads);

export default router;
