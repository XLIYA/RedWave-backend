import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { listFollowing } from '../../controllers/follow-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/follow/following/me:
 *   get:
 *     summary: Who I follow
 *     tags: [Follow]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 */
router.get('/following/me', protect, listFollowing);

/**
 * @openapi
 * /api/follow/following/{id}:
 *   get:
 *     summary: Users followed by a user
 *     tags: [Follow]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200: { description: OK }
 */
router.get('/following/:id', listFollowing);

export default router;
