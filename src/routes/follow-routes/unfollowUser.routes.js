import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { unfollowUser } from '../../controllers/follow-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/follow/{id}:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Follow]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200: { description: OK }
 */
router.delete('/:id', protect, unfollowUser);

export default router;
