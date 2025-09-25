import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { setOnlineStatus } from '../../controllers/user-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/users/me/online-status:
 *   post:
 *     summary: Set online status
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/me/online-status', protect, setOnlineStatus);

export default router;
