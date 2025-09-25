import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { updateMe } from '../../controllers/user-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.put('/me', protect, updateMe);

export default router;
