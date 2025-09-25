import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { getMyLikes } from '../../controllers/user-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/users/me/likes:
 *   get:
 *     summary: List songs I liked
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me/likes', protect, getMyLikes);

export default router;
