import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { listFollowers } from '../../controllers/follow-controllers/index.js';

const router = express.Router();

/**
 * @openapi
 * /api/follow/followers/me:
 *   get:
 *     summary: My followers
 *     tags: [Follow]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 */
router.get('/followers/me', protect, listFollowers);

/**
 * @openapi
 * /api/follow/followers/{id}:
 *   get:
 *     summary: Followers of a user
 *     tags: [Follow]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdPath'
 *     responses:
 *       200: { description: OK }
 */
router.get('/followers/:id', listFollowers);

export default router;
