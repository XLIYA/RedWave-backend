
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { changePassword } from '../../controllers/user-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/users/me/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/me/change-password', protect, changePassword);

export default router;
