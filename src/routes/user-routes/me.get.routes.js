import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { getMe } from '../../controllers/user-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/me', protect, getMe);

export default router;
